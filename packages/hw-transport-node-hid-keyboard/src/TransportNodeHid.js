//@flow

import HID from "node-hid";
import Transport from "@trustcrypto/hw-transport";
import { log } from "@ledgerhq/logs";
import type {
  Observer,
  DescriptorEvent,
  Subscription
} from "@trustcrypto/hw-transport";
import { ledgerUSBVendorId } from "@trustcrypto/devices";
import hidFraming from "@trustcrypto/devices/lib/hid-framing";
import { identifyUSBProductId } from "@trustcrypto/devices";
import type { DeviceModel } from "@trustcrypto/devices";
import { TransportError, DisconnectedDevice } from "@ledgerhq/errors";

const filterInterface = device =>
  ["win32", "darwin"].includes(process.platform)
    ? // $FlowFixMe
      device.usagePage === 0xf1d0
    : device.interface === 0;

function getDevices(): Array<*> {
  // $FlowFixMe
  return HID.devices(ledgerUSBVendorId, 0x0).filter(filterInterface);
}

const isDisconnectedError = e =>
  e && e.message && e.message.indexOf("HID") >= 0;

/**
 * node-hid Transport minimal implementation
 * @example
 * import TransportNodeHid from "@trustcrypto/hw-transport-node-hid-noevents";
 * ...
 * TransportNodeHid.create().then(transport => ...)
 */
export default class TransportNodeHidNoEvents extends Transport<?string> {
  /**
   *
   */
  static isSupported = (): Promise<boolean> =>
    Promise.resolve(typeof HID.HID === "function");

  /**
   *
   */
  static list = (): Promise<(?string)[]> =>
    Promise.resolve(getDevices().map(d => d.path));

  /**
   */
  static listen = (
    observer: Observer<DescriptorEvent<?string>>
  ): Subscription => {
    getDevices().forEach(device => {
      const deviceModel = identifyUSBProductId(device.productId);
      observer.next({
        type: "add",
        descriptor: device.path,
        deviceModel,
        device
      });
    });
    observer.complete();
    return { unsubscribe: () => {} };
  };

  /**
   * if path="" is not provided, the library will take the first device
   */
  static async open(path: ?string) {
    if (path) {
      return Promise.resolve(new TransportNodeHidNoEvents(new HID.HID(path)));
    }
    const device = getDevices()[0];
    if (!device) throw new TransportError("NoDevice", "NoDevice");
    return Promise.resolve(
      new TransportNodeHidNoEvents(new HID.HID(device.path))
    );
  }

  device: HID.HID;
  deviceModel: ?DeviceModel;

  channel = Math.floor(Math.random() * 0xffff);
  packetSize = 64;
  disconnected = false;

  constructor(device: HID.HID) {
    super();
    this.device = device;
    // $FlowFixMe
    const info = device.getDeviceInfo();
    this.deviceModel =
      info && info.serialNumber
        ? identifyUSBProductId(parseInt(info.serialNumber, 16))
        : null;
  }

  setDisconnected = () => {
    if (!this.disconnected) {
      this.emit("disconnect");
      this.disconnected = true;
    }
  };

  writeHID = async (content: Buffer): Promise<void> => {
    let wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    const data = [];
    var seqnum;
    for (let i = 0; i < content.length; i++) {
      data.push(content[i]);
    }
    try {
      for (let i = content.length; i < 70; i++) {
        data.push(0);
      }
      for (var i=0; i<10; i++) {
        seqnum = 0x80+i;
        var datachunk = data.slice(i*7,(i*8)+7-i);
        datachunk.unshift(0);
        datachunk = datachunk.concat(seqnum);
        if (seqnum==0x89) {
          //Todo add crc in bytes 3 - 4
          datachunk  = [ 0, 0, 0, 0xC1, 0xC2, 0, 0, 255, 0x89];
        }
          console.log("sent feature report");
          console.log(datachunk);
          this.device.sendFeatureReport(datachunk);
          var res = this.device.getFeatureReport(0, 8);
          await wait(50);
          const buf = Buffer.from(res);
          console.log("got feature report", + buf.toString("hex"));
      }
      return Promise.resolve();
    } catch (e) {
      if (isDisconnectedError(e)) {
        this.setDisconnected();
        return Promise.reject(new DisconnectedDevice());
      }
      return Promise.reject();
    }
  };

  readHID = async (): Promise<Buffer> => {
    let wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    try {
      console.log("reading response");
      var step=0;
      const data = [];
      while (step<=10) {
        var res = this.device.getFeatureReport(0, 8);
        await wait(50);
        if (!res) {
          return Promise.reject(new DisconnectedDevice());
        }
        console.log("got feature report")
        console.log(res);
        if (res[7] == 0x89 || (res[7] <= 0xaf && res[7] >= 0xa1)) { //Device still processessing request need to delay
          console.log("1")
          await wait(50);
          step=0;
          console.log("2")
        } else if (step==0 && res[7] == 0xC0) { // First packet of response
          console.log("3")
          for (let i = 0; i < 7; i++) {
            data.push(res[i]);
          }
          step=1;
          console.log("4")
        } else if (res[7] > 0xC0 && res[7] <= 0xC9) { // 2nd+ packet
          console.log("5")
          for (let i = 0; i < 7; i++) {
            data.push(res[i]);
          }
          step++;
          console.log("6")
        } else if (res[7] == 0xC0) { // last packet of response
          console.log("7")
          var datachunk  = [ 0, 0, 0, 0, 0, 0, 0, 0, 0x8F];
          this.device.sendFeatureReport(datachunk);
          this.device.getFeatureReport(0, 8);
          console.log("8")
          const buffer = Buffer.from(data);
          return Promise.resolve(buffer);
        } else {  // Error?
          console.log("9")
          return Promise.reject();
        }
        console.log("fullbuffer");
        console.log(data);
      }
    } catch (e) {
      if (isDisconnectedError(e)) {
        this.setDisconnected();
        return Promise.reject(new DisconnectedDevice());
      }
      return Promise.reject();
    }
}

  /**
   * Exchange with the device using APDU protocol.
   * @param apdu
   * @returns a promise of apdu response
   */
  exchange = (apdu: Buffer): Promise<Buffer> =>
    this.exchangeAtomicImpl(async () => {
      const { channel, packetSize } = this;
      log("apdu", "=> " + apdu.toString("hex"));

      const framing = hidFraming(channel, packetSize);

      // Write...
      const blocks = framing.makeBlocks(apdu);
      for (let i = 0; i < blocks.length; i++) {
        log("hid-frame", "=> " + blocks[i].toString("hex"));
        await this.writeHID(blocks[i]);
      }

      // Read...
      let result;
      let acc;
      while (!(result = framing.getReducedResult(acc))) {
        const buffer = await this.readHID();
        log("hid-frame", "<= " + buffer.toString("hex"));
        acc = framing.reduceResponse(acc, buffer);
      }

      log("apdu", "<= " + result.toString("hex"));
      return result;
    });

  setScrambleKey() {}

  /**
   * release the USB device.
   */
  async close(): Promise<void> {
    await this.exchangeBusyPromise;
    this.device.close();
  }
}
