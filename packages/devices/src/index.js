// @flow


export const IIGenericHID = 0x01;
export const IIKeyboardHID = 0x02;
export const IIU2F = 0x04;
export const IICCID = 0x08;
export const IIWebUSB = 0x10;

const devices = {
  prod: {
    id: "onlykey",
    productName: "onlykey",
    productIdMM: 0,
    legacyUsbProductId: 0x60fc,
    usbOnly: true
  },
  dev: {
    id: "onlykey dev",
    productName: "onlykey dev",
    productIdMM: 0,
    legacyUsbProductId: 0x0486,
    usbOnly: true
  },
  bootloader: {
    id: "onlykey bootloader",
    productName: "onlykey bootloader",
    productIdMM: 0,
    legacyUsbProductId: 0x60fc,
    usbOnly: true
  }
};

// $FlowFixMe
const devicesList: DeviceModel[] = Object.values(devices);

/**
 *
 */
export const ledgerUSBVendorId = 0x16c0;

/**
 *
 */
export const getDeviceModel = (id: DeviceModelId): DeviceModel => {
  const info = devices[id];
  if (!info) throw new Error("device '" + id + "' does not exist");
  return info;
};

/**
 *
 */
export const identifyUSBProductId = (usbProductId: number): ?DeviceModel => {
  const legacy = devicesList.find(d => d.legacyUsbProductId === usbProductId);
  if (legacy) return legacy;
  const mm = usbProductId >> 8;
  const deviceModel = devicesList.find(d => d.productIdMM === mm);
  return deviceModel;
};

const bluetoothServices: string[] = [];
const serviceUuidToInfos: {
  [_: string]: BluetoothInfos
} = {};

for (let id in devices) {
  const deviceModel = devices[id];
  const { bluetoothSpec } = deviceModel;
  if (bluetoothSpec) {
    for (let i = 0; i < bluetoothSpec.length; i++) {
      const spec = bluetoothSpec[i];
      bluetoothServices.push(spec.serviceUuid);
      serviceUuidToInfos[spec.serviceUuid] = { deviceModel, ...spec };
    }
  }
}

/**
 *
 */
export const getBluetoothServiceUuids = () => bluetoothServices;

/**
 *
 */
export const getInfosForServiceUuid = (uuid: string): ?BluetoothInfos =>
  serviceUuidToInfos[uuid.toLowerCase()];

/**
 *
 */
export type DeviceModelId = $Keys<typeof devices>;

/**
 *
 */
export type DeviceModel = {
  id: DeviceModelId,
  productName: string,
  productIdMM: number,
  legacyUsbProductId: number,
  usbOnly: boolean,
  bluetoothSpec?: Array<{
    serviceUuid: string,
    writeUuid: string,
    notifyUuid: string
  }>
};

/**
 *
 */
export type BluetoothInfos = {
  deviceModel: DeviceModel,
  serviceUuid: string,
  writeUuid: string,
  notifyUuid: string
};
