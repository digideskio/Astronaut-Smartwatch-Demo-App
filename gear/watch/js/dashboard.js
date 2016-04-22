angular.module("Watch")
    .controller("DashboardCtrl", function ($rootScope, $scope, $interval, Api, System, TimerCommon, Timers, AppState) {
        $scope.colorGood = '#1EDF7A';
        $scope.colorWeak = '#FFE620';
        $scope.colorBad = '#FC3D21';
        $scope.battery = System.getBattery();
        $scope.timerz = Timers;
        $scope.state = AppState;

        $rootScope.$on('push', function (event, message) {
            $scope.refreshData();
        });

        $scope.onDashboardClick = function () {
            tau.changePage('hsectionchangerPage');
        };

        $scope.onBluetoothSvgReady = function () {
            var bluetoothSnap = Snap("#bluetooth");
            $scope.bluetooth = bluetoothSnap.select("#bluetooth-path");
            $scope.bluetooth.attr({
                fill: System.getBluetooth().status ? "#ffffff" : "#999999"
            });
        };

        $scope.onWifiSvgReady = function () {
            var wifiSnap = Snap("#wifi");
            $scope.wifi = wifiSnap.select("#wifi-path");
            $scope.wifi.attr({
                fill: System.getWifi().status ? "#ffffff" : "#999999"
            });
        };

        $scope.onBandsSvgReady = function () {
            $scope.bandsSnap = Snap("#bands");
            $scope.sBandUp1 = $scope.bandsSnap.select("#s-band-1");
            $scope.sBandUp2 = $scope.bandsSnap.select("#s-band-2");
            $scope.sBandDown2 = $scope.bandsSnap.select("#s-band-3");
            $scope.sBandDown1 = $scope.bandsSnap.select("#s-band-4");
            $scope.kuBandUp1 = $scope.bandsSnap.select("#k-band-1");
            $scope.kuBandUp2 = $scope.bandsSnap.select("#k-band-2");
            $scope.kuBandDown2 = $scope.bandsSnap.select("#k-band-3");
            $scope.kuBandDown1 = $scope.bandsSnap.select("#k-band-4");

            $scope.oca = $scope.bandsSnap.select("#OCA");
            $scope.iac = $scope.bandsSnap.select("#IAC");

            $scope.refreshData();
        };

        $scope.refreshData = function () {
            Api.comms.get(function (commsData) {
                if ($scope.bandsSnap) {
                    $scope.updateCommsDisplay(commsData.comms);
                }
            });

            Api.alerts.query(function (data) {
                $scope.alerts = data;
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

        $scope.isTimerPassHour = function (ind) {
            return TimerCommon.isTimerPassHour(ind);
        };

        $scope.getTimerColor = function (ind) {
            return TimerCommon.getTimerColor(ind);
        };

        $scope.timeLeft = function (index) {
            return TimerCommon.timeLeft(index);
        };

        $rootScope.$on('refresh', function () {
            $scope.refreshData();
        });
    });