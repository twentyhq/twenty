import { isValidHostname } from '@/utils/url/isValidHostname';

describe('isValidHostname', () => {
  it(`should return true if string google`, () => {
    expect(isValidHostname('google')).toBeFalsy();
  });

  it(`should return true if string google.com`, () => {
    expect(isValidHostname('google.com')).toBeTruthy();
  });

  it(`should return true if string bbc.co.uk`, () => {
    expect(isValidHostname('bbc.co.uk')).toBeTruthy();
  });

  it(`should return true if string www.subdomain.example.com`, () => {
    expect(isValidHostname('www.subdomain.example.com')).toBeTruthy();
  });

  it(`should return true if string web.io`, () => {
    expect(isValidHostname('web.io')).toBeTruthy();
  });

  it(`should return true if string x.com`, () => {
    expect(isValidHostname('x.com')).toBeTruthy();
  });

  it(`should return true if string 2.com`, () => {
    expect(isValidHostname('2.com')).toBeTruthy();
  });

  it(`should return true if string localhost`, () => {
    expect(isValidHostname('localhost')).toBeTruthy();
  });

  it(`should return true if string 127.0.0.1`, () => {
    expect(isValidHostname('127.0.0.1')).toBeTruthy();
  });

  it(`should return false if string 2`, () => {
    expect(isValidHostname('2')).toBeFalsy();
  });

  it(`should return false if string contains non-valid characters`, () => {
    expect(isValidHostname('subdomain.example.com/path')).toBeFalsy();
  });

  it(`should return false if string is empty`, () => {
    expect(isValidHostname('')).toBeFalsy();
  });

  it(`should return false if string is one word`, () => {
    expect(isValidHostname('subdomain')).toBeFalsy();
  });

  it(`should return true if string is ip address`, () => {
    expect(isValidHostname('192.168.2.0')).toBeTruthy();
  });

  it(`should return false if string is ip address but allowIp is false`, () => {
    expect(isValidHostname('192.168.2.0', { allowIp: false })).toBeFalsy();
  });

  it(`should return true if string is localhost but allowLocalhost is false`, () => {
    expect(isValidHostname('localhost', { allowLocalhost: false })).toBeFalsy();
  });

  it(`should return true if string is localhost but allowLocalhost is true`, () => {
    expect(isValidHostname('localhost', { allowLocalhost: true })).toBeTruthy();
  });
});
