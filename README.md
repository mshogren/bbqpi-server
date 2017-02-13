# bbqpi-server

[![Build Status](https://travis-ci.org/mshogren/bbqpi-server.svg?branch=master)](https://travis-ci.org/mshogren/bbqpi-server)

[![codecov](https://codecov.io/gh/mshogren/bbqpi-server/branch/master/graph/badge.svg)](https://codecov.io/gh/mshogren/bbqpi-server)

[![Greenkeeper badge](https://badges.greenkeeper.io/mshogren/bbqpi-server.svg)](https://greenkeeper.io/)

A node and firebase based service to install on a Raspberry Pi for controlling a charcoal bbq fan blower and temperature sensors.

Eventually I will put up a circuit diagram and some photos along with some instructions in case any one else wants to try building something like this.

## Raspberry Pi ##

There were just a few steps required to create an environment suitable for this code to run in on my Raspberry Pi:
- I started by installing [NOOBS Lite](https://www.raspberrypi.org/documentation/installation/noobs.md) on my SDCard and then installing Raspbian Jessie Lite.

- Then I installed [nodejs](https://nodejs.org) using these commands

  ```
  curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```
  
- The I installed [Wiring-Pi](http://wiringpi.com/)

  ```
  sudo apt-get install wiringpi
  ```

## Running ##
First get the source and install the dependencies:

```
git clone https://github.com/mshogren/bbqpi-server.git
cd bbqpi-server
npm install
```

To run the service you will require a file called `config.json` in the root of the project directory.  That file should contain the information required to initialize the [Firebase SDK](https://firebase.google.com/docs/web/setup) and to authenticate using [Google OAuth Device Flow](https://developers.google.com/identity/sign-in/devices).

This is what it should look like:
  
```
{                                                                                           
  "firebaseConfig": {                                                                       
    "apiKey": "<API_KEY>",                                    
    "databaseURL": "https://<DATABASE_NAME>.firebaseio.com"                                     
  },                                                                                        
  "googleOAuthConfig": {                                                                    
    "deviceRequestUrl": "https://accounts.google.com/o/oauth2/device/code",                 
    "client_id": "<CLIENT_ID>",
    "client_secret": "<CLIENT_SECRET>",                                            
    "scope": "email profile",                                                               
    "tokenRequestUrl": "https://www.googleapis.com/oauth2/v4/token"                         
  }
}
```

I use [pm2](http://pm2.keymetrics.io/) to run the service and have it restarted between machine restarts

    pm2 start src/server.js --watch --ignore-watch="config.json node_modules .git coverage .stryker-tmp" --log-date-format="YYYY-MM-DD HH:mm:ss"

Then I can use the folloowing command to monitor the logs in a console window

    pm2 logs --timestamp

## GPIO ##
One important thing that trips me up from time to time is making sure that the server has permissions to access the GPIO pins I am using.  I use the [gpio utility](http://wiringpi.com/the-gpio-utility/) from the [WiringPi project](http://wiringpi.com).  

If you are using Raspbian Jessie it can be install using:

    sudo apt-get install wiringpi

There is also a wrapper for WiringPi available as an npm package called [pi-gpioutil](https://www.npmjs.com/package/pi-gpioutil).

Note the pin I am using for the fan is exported by the gpio utility using its BCM-GPIO pin number which is 19.  Unfortunately WiringPi uses a different numbering scheme to write to the pin where it is number 24.  For more see [this](https://pinout.xyz/pinout/wiringpi). 
