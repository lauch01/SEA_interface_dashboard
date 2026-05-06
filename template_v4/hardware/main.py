from machine import Pin, I2C, UART
import dht
import time
import ujson

# =========================
# CLASE BME280
# =========================
class BME280:
    def __init__(self, i2c, addr=0x76):
        self.i2c = i2c
        self.addr = addr

        self.chip_id = self.i2c.readfrom_mem(addr, 0xD0, 1)[0]

        calib = self.i2c.readfrom_mem(addr, 0x88, 24)

        self.dig_T1 = calib[1] << 8 | calib[0]
        self.dig_T2 = self._signed(calib[3] << 8 | calib[2])
        self.dig_T3 = self._signed(calib[5] << 8 | calib[4])

        self.dig_P1 = calib[7] << 8 | calib[6]
        self.dig_P2 = self._signed(calib[9] << 8 | calib[8])
        self.dig_P3 = self._signed(calib[11] << 8 | calib[10])
        self.dig_P4 = self._signed(calib[13] << 8 | calib[12])
        self.dig_P5 = self._signed(calib[15] << 8 | calib[14])
        self.dig_P6 = self._signed(calib[17] << 8 | calib[16])
        self.dig_P7 = self._signed(calib[19] << 8 | calib[18])
        self.dig_P8 = self._signed(calib[21] << 8 | calib[20])
        self.dig_P9 = self._signed(calib[23] << 8 | calib[22])

        calib_h = self.i2c.readfrom_mem(addr, 0xE1, 7)

        self.dig_H1 = self.i2c.readfrom_mem(addr, 0xA1, 1)[0]
        self.dig_H2 = self._signed(calib_h[1] << 8 | calib_h[0])
        self.dig_H3 = calib_h[2]
        self.dig_H4 = (calib_h[3] << 4) | (calib_h[4] & 0x0F)
        self.dig_H5 = (calib_h[5] << 4) | (calib_h[4] >> 4)
        self.dig_H6 = self._signed(calib_h[6])

        self.i2c.writeto_mem(addr, 0xF2, b'\x01')
        self.i2c.writeto_mem(addr, 0xF4, b'\x27')

    def _signed(self, val):
        if val > 32767:
            val -= 65536
        return val

    def read_raw(self):
        data = self.i2c.readfrom_mem(self.addr, 0xF7, 8)

        adc_p = (data[0] << 12) | (data[1] << 4) | (data[2] >> 4)
        adc_t = (data[3] << 12) | (data[4] << 4) | (data[5] >> 4)
        adc_h = (data[6] << 8) | data[7]

        return adc_t, adc_p, adc_h

    def read(self):
        adc_t, adc_p, adc_h = self.read_raw()

        var1 = (((adc_t >> 3) - (self.dig_T1 << 1)) * self.dig_T2) >> 11
        var2 = (((((adc_t >> 4) - self.dig_T1) * ((adc_t >> 4) - self.dig_T1)) >> 12) * self.dig_T3) >> 14

        self.t_fine = var1 + var2
        T = (self.t_fine * 5 + 128) >> 8

        var1 = self.t_fine - 128000
        var2 = var1 * var1 * self.dig_P6
        var2 = var2 + ((var1 * self.dig_P5) << 17)
        var2 = var2 + (self.dig_P4 << 35)
        var1 = ((var1 * var1 * self.dig_P3) >> 8) + ((var1 * self.dig_P2) << 12)
        var1 = (((1 << 47) + var1) * self.dig_P1) >> 33

        if var1 == 0:
            return None, None, None

        p = 1048576 - adc_p
        p = ((p << 31) - var2) * 3125 // var1
        var1 = (self.dig_P9 * (p >> 13) * (p >> 13)) >> 25
        var2 = (self.dig_P8 * p) >> 19
        p = ((p + var1 + var2) >> 8) + (self.dig_P7 << 4)

        h = self.t_fine - 76800
        h = (((((adc_h << 14) - (self.dig_H4 << 20) - (self.dig_H5 * h)) + 16384) >> 15) *
             (((((((h * self.dig_H6) >> 10) * (((h * self.dig_H3) >> 11) + 32768)) >> 10) + 2097152) *
               self.dig_H2 + 8192) >> 14))
        h = h - (((((h >> 15) * (h >> 15)) >> 7) * self.dig_H1) >> 4)

        if h < 0:
            h = 0
        elif h > 419430400:
            h = 419430400

        h = h >> 12

        return T / 100, p / 25600, h / 1024


# =========================
# CLASE LTR390 (UV)
# =========================
class LTR390:
    def __init__(self, i2c, addr=0x53):
        self.i2c = i2c
        self.addr = addr

        self.write(0x23, 0x01)  # RESET
        time.sleep(0.1)

        self.write(0x00, 0x02)  # ENABLE
        self.write(0x00, 0x0A)  # UV MODE
        self.write(0x05, 0x03)  # Ganancia alta

    def write(self, reg, val):
        self.i2c.writeto_mem(self.addr, reg, bytes([val]))

    def read(self, reg, n=1):
        return self.i2c.readfrom_mem(self.addr, reg, n)

    def read_uv(self):
        data = self.read(0x10, 3)
        return data[0] | (data[1] << 8) | (data[2] << 16)


# =========================
# FUNCIONES GPS
# =========================
def convert_to_decimal(raw, direction, is_longitude=False):
    if raw == "":
        return None

    if is_longitude:
        degrees = int(raw[:3])
        minutes = float(raw[3:])
    else:
        degrees = int(raw[:2])
        minutes = float(raw[2:])

    decimal = degrees + (minutes / 60)

    if direction in ['S', 'W']:
        decimal *= -1

    return decimal


# =========================
# INICIALIZACIÓN
# =========================

# DHT11
dht_sensor = dht.DHT11(Pin(15))

# I2C compartido
i2c = I2C(0, scl=Pin(17), sda=Pin(16), freq=100000)

# Sensores I2C
bme_sensor = BME280(i2c)
ltr_sensor = LTR390(i2c)

# GPS UART1
uart = UART(1, baudrate=9600, tx=Pin(4), rx=Pin(5))

# Variables GPS guardadas

gps_lat = None
gps_lon = None
gps_alt = None
gps_sats = None
gps_time = None

# =========================
# LOOP PRINCIPAL
# =========================
while True:
    dht_temp = None
    dht_hum = None
    bme_temp = None
    bme_pres = None
    bme_hum = None
    uv = None

    try:
        dht_sensor.measure()
        dht_temp = dht_sensor.temperature()
        dht_hum = dht_sensor.humidity()
    except OSError:
        pass

    try:
        bme_temp, bme_pres, bme_hum = bme_sensor.read()
    except Exception:
        pass

    try:
        uv = ltr_sensor.read_uv()
    except Exception:
        pass

    try:
        start_time = time.ticks_ms()
        while time.ticks_diff(time.ticks_ms(), start_time) < 500:
            if uart.any():
                line = uart.readline()

                if line:
                    try:
                        line = line.decode('utf-8').strip()

                        if line.startswith('$GPGGA'):
                            parts = line.split(',')

                            if len(parts) > 9 and parts[6] == '1':
                                gps_lat = convert_to_decimal(parts[2], parts[3], False)
                                gps_lon = convert_to_decimal(parts[4], parts[5], True)
                                gps_sats = int(parts[7])
                                gps_alt = float(parts[9])

                        elif line.startswith('$GPRMC'):
                            parts = line.split(',')

                            if len(parts) > 2 and parts[2] == 'A':
                                time_raw = parts[1]
                                if time_raw:
                                    h = time_raw[0:2]
                                    m = time_raw[2:4]
                                    s = time_raw[4:6]
                                    gps_time = "{}:{}:{}".format(h, m, s)

                    except Exception:
                        pass
    except Exception:
        pass

    data = {
        "dht_temp": dht_temp,
        "dht_hum": dht_hum,
        "bme_temp": bme_temp,
        "bme_pres": bme_pres,
        "bme_hum": bme_hum,
        "uv": uv,
        "gps_lat": gps_lat,
        "gps_lon": gps_lon,
        "gps_alt": gps_alt,
        "gps_sats": gps_sats,
        "gps_time": gps_time
    }

    print(ujson.dumps(data))

    time.sleep(2)