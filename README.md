# bbqpi-server
A node and firebase based service to install on a Raspberry Pi for controlling a charcoal bbq fan blower and temperature sensors.

Eventually I will put up a circuit diagram and some photos along with some instructions in case any one else wants to try building something like this.

## GPIO ##
One important thing that trips me up from time to time is making sure that the server has permissions to access the GPIO pins I am using.  I use the [gpio utility](http://wiringpi.com/the-gpio-utility/) from the [WiringPi project](http://wiringpi.com).  

If you are using Raspbian Jessie it can be install using:

    sudo apt-get install wiringpi

There is also a wrapper for WiringPi available as an npm package called [pi-gpioutil](https://www.npmjs.com/package/pi-gpioutil).

Note the pin I am using for the fan is exported by the gpio utility using its BCM-GPIO pin number which is 19.  Unfortunately WiringPi uses a different numbering scheme to write to the pin where it is number 24.  For more see [this](https://pinout.xyz/pinout/wiringpi). 
