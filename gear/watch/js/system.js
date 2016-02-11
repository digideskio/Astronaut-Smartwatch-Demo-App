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
                level: 50,
                getLevel: function () {
                    return this.level;
                }
            }
        };

        //var blueToothadapter = tizen.bluetooth.getDefaultAdapter();
        //blueToothadapter.setChangeListener({
        //    onstatechanged: function (powered) {
        //        systemInfo.bluetooth = powered;
        //    }
        //});
        //
        //tizen.systeminfo.getPropertyValue("WIFI_NETWORK", function (wifi) {
        //    systemInfo.wifi = wifi.status == "ON";
        //});
        //
        //tizen.systeminfo.addPropertyValueChangeListener("WIFI_NETWORK", function (wifi) {
        //    systemInfo.wifi = wifi.status == "ON";
        //});

        navigator.getBattery().then(function (battery) {
            systemInfo.battery.level = Math.floor(battery.level * 100);

            battery.onlevelchange = function () {
                systemInfo.battery.level = Math.floor(battery.level * 100);
            }
        });

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
