// @flow
import { onlykeyUSBVendorId } from "trustcrypto/devices";

const onlykeyDevices = [{ vendorId: onlykeyUSBVendorId }];

export async function requestonlykeyDevice(): Promise<USBDevice> {
  // $FlowFixMe
  const device = await navigator.usb.requestDevice({ filters: onlykeyDevices });
  return device;
}

export async function getonlykeyDevices(): Promise<USBDevice[]> {
  // $FlowFixMe
  const devices = await navigator.usb.getDevices();
  return devices.filter(d => d.vendorId === onlykeyUSBVendorId);
}

export async function getFirstonlykeyDevice(): Promise<USBDevice> {
  const existingDevices = await getonlykeyDevices();
  if (existingDevices.length > 0) return existingDevices[0];
  return requestonlykeyDevice();
}

export const isSupported = (): Promise<boolean> =>
  Promise.resolve(
    // $FlowFixMe
    !!navigator &&
      !!navigator.usb &&
      typeof navigator.usb.getDevices === "function"
  );
