angular.module("Watch")
    .factory("System", function () {
        var systemInfo = {
            wifi: {
                status: false
            },
            bluetooth: {
                status: false
            },
            battery: {
                level: 0,
                getLevel: function () {
                    return this.level;
                }
            }
        };

        if (typeof tizen !== 'undefined') {
            if (tizen.bluetooth) {
                var blueToothadapter = tizen.bluetooth.getDefaultAdapter();
                systemInfo.bluetooth = blueToothadapter.powered;

            }
            if (tizen.systeminfo) {
                tizen.systeminfo.getPropertyValue("WIFI_NETWORK", function (wifi) {
                    systemInfo.wifi = wifi.status == "ON";
                });

                tizen.systeminfo.addPropertyValueChangeListener("WIFI_NETWORK", function (wifi) {
                    systemInfo.wifi = wifi.status == "ON";
                });
            }

            	var battery = navigator.battery || navigator.webkitBattery;
            	systemInfo.battery.level = Math.floor(battery.level * 100);

                    battery.addEventListener('levelchange',  function () {
                    	systemInfo.battery.level = Math.floor(battery.level * 100);
                    });


        }

        systemInfo.getWifi = function () {
            return systemInfo.wifi;
        };

        systemInfo.getBluetooth = function () {
            return systemInfo.bluetooth;
        };

        systemInfo.getBattery = function () {
            return systemInfo.battery;
        };

        return systemInfo;
    });
