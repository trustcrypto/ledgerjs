// @flow
import HID from "node-hid";
import { onlykeyUSBVendorId } from "trustcrypto/devices";

const filterInterface = device =>
  ["win32", "darwin"].includes(process.platform)
    ? // $FlowFixMe bug in HID flow def
      device.usagePage === 0xffa0
    : device.interface === 0;

export default function getDevices(): Array<*> {
  // $FlowFixMe bug in HID flow def
  return HID.devices(onlykeyUSBVendorId, 0x0).filter(filterInterface);
}
