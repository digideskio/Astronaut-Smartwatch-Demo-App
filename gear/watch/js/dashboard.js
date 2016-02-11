angular.module("Watch")
    .controller("DashboardCtrl", function ($rootScope, $scope, Api, System, TimerTick) {
        $scope.colorGood = '#1EDF7A';
        $scope.colorWeak = '#FFE620';
        $scope.colorBad = '#FC3D21';
        $scope.time = new Date();
        $scope.battery = System.getBattery();

        $scope.onDashboardClick = function () {
            tau.changePage('hsectionchangerPage');
        };

        $scope.onBluetoothSvgReady = function () {
            var bluetoothSnap = Snap("#bluetooth");
            $scope.bluetooth = bluetoothSnap.select("#bluetooth-path");
            $scope.bluetooth.attr({
                fill: System.getBluetooth() ? "#fff" : "#999"
            });
        };

        $scope.onWifiSvgReady = function () {
            var wifiSnap = Snap("#wifi");
            $scope.wifi = wifiSnap.select("#wifi-path");
            $scope.wifi.attr({
                fill: System.getWifi() ? "#fff" : "#999"
            });
        };

        $scope.onBandsSvgReady = function () {
            var bandsSnap = Snap("#bands");
            $scope.sBandUp1 = bandsSnap.select("#s-band-1");
            $scope.sBandUp2 = bandsSnap.select("#s-band-2");
            $scope.sBandDown2 = bandsSnap.select("#s-band-3");
            $scope.sBandDown1 = bandsSnap.select("#s-band-4");
            $scope.kuBandUp1 = bandsSnap.select("#k-band-1");
            $scope.kuBandUp2 = bandsSnap.select("#k-band-2");
            $scope.kuBandDown2 = bandsSnap.select("#k-band-3");
            $scope.kuBandDown1 = bandsSnap.select("#k-band-4");

            $scope.oca = bandsSnap.select("#OCA");
            $scope.iac = bandsSnap.select("#IAC");

            $scope.refreshComms();
        };

        $scope.refreshComms = function () {
            Api.comms.get(function (commsData) {
                $scope.updateCommsDisplay(commsData.comms);
            });
        };

        $scope.updateCommsDisplay = function (commsData) {
            $scope.applyColor($scope.sBandUp1, commsData.sband.up1);
            $scope.applyColor($scope.sBandUp2, commsData.sband.up2);
            $scope.applyColor($scope.sBandDown1, commsData.sband.down1);
            $scope.applyColor($scope.sBandDown2, commsData.sband.down2);
            $scope.applyColor($scope.kuBandUp1, commsData.kuband.up1);
            $scope.applyColor($scope.kuBandUp2, commsData.kuband.up2);
            $scope.applyColor($scope.kuBandDown1, commsData.kuband.down1);
            $scope.applyColor($scope.kuBandDown2, commsData.kuband.down2);

            $scope.applyColor($scope.oca, commsData.oca, true);
            $scope.applyColor($scope.iac, commsData.iac, true);
        };

        $scope.applyColor = function (elem, status, applyStroke) {
            switch (status) {
                case 'Good':
                    elem.attr({
                        fill: $scope.colorGood
                    });
                    if (applyStroke) {
                        elem.attr({
                            stroke: $scope.colorGood
                        });
                    }
                    break;
                case 'Weak':
                    elem.attr({
                        fill: $scope.colorWeak
                    });
                    if (applyStroke) {
                        elem.attr({
                            stroke: $scope.colorWeak
                        });
                    }
                    break;
                case 'Bad':
                    elem.attr({
                        fill: $scope.colorBad
                    });
                    if (applyStroke) {
                        elem.attr({
                            stroke: $scope.colorBad
                        });
                    }

                    break;
            }
        };

        $rootScope.$on('timerTick', function (event, data) {
            $scope.time = new Date();
        });

    });