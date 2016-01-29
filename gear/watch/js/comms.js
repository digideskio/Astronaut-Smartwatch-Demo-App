angular.module('Watch')
    .controller('CommsCtrl', function ($scope, Api) {
        $scope.colorGood = '#1EDF7A';
        $scope.colorWeak = '#FFE620';
        $scope.colorBad = '#FC3D21';

        $scope.onInitSvg = function () {
            $scope.commsSnap = Snap("#comms-bands");
            $scope.s1UpWeak = $scope.commsSnap.select("#s-one-up-yellow");
            $scope.s1UpBad = $scope.commsSnap.select("#s-one-up-red");
            $scope.s2UpWeak = $scope.commsSnap.select("#s-two-up-yellow");
            $scope.s2UpBad = $scope.commsSnap.select("#s-two-up-red");
            $scope.s1DownWeak = $scope.commsSnap.select("#s-one-bottom-yellow");
            $scope.s1DownBad = $scope.commsSnap.select("#s-one-bottom-red");
            $scope.s2DownWeak = $scope.commsSnap.select("#s-two-bottom-yellow");
            $scope.s2DownBad = $scope.commsSnap.select("#s-two-bottom-red");

            $scope.ku1UpWeak = $scope.commsSnap.select("#ku-one-up-yellow");
            $scope.ku1UpBad = $scope.commsSnap.select("#ku-one-up-red");
            $scope.ku2UpWeak = $scope.commsSnap.select("#ku-two-up-yellow");
            $scope.ku2UpBad = $scope.commsSnap.select("#ku-two-up-red");
            $scope.ku1DownWeak = $scope.commsSnap.select("#ku-one-down-yellow");
            $scope.ku1DownBad = $scope.commsSnap.select("#ku-one-bottom-red");
            $scope.ku2DownWeak = $scope.commsSnap.select("#ku-two-down-yellow");
            $scope.ku2DownBad = $scope.commsSnap.select("#ku-two-bottom-red");

            var networksSnap = Snap("#networks");
            $scope.oca = networksSnap.select("#OCA");
            $scope.iac = networksSnap.select("#IAC");
            $scope.refreshComms();
        };

        $scope.refreshComms = function () {
            Api.comms.get(function (commsData) {
                $scope.updateMainComms(commsData.comms);
                $scope.updateNetworks(commsData.comms);
                $scope.drawOutages(commsData.outages)
            });
        };

        $scope.updateNetworks = function (commsData) {
            $scope.applyColor($scope.oca, commsData.oca);
            $scope.applyColor($scope.iac, commsData.iac);
        };

        $scope.applyColor = function (elem, status) {
            switch (status) {
                case 'Good':
                    elem.attr({
                        stroke: $scope.colorGood,
                        fill: $scope.colorGood
                    });
                    break;
                case 'Weak':
                    elem.attr({
                        stroke: $scope.colorWeak,
                        fill: $scope.colorWeak
                    });
                    break;
                case 'Bad':
                    elem.attr({
                        stroke: $scope.colorBad,
                        fill: $scope.colorBad
                    });
                    break;
            }
        };

        $scope.updateMainComms = function (commsData) {
            $scope.s1UpWeak.attr({
                visibility: commsData.sband.up1 == 'Weak' ? 'visible' : 'hidden'
            });
            $scope.s1UpBad.attr({
                visibility: commsData.sband.up1 == 'Bad' ? 'visible' : 'hidden'
            });
            $scope.s2UpWeak.attr({
                visibility: commsData.sband.up2 == 'Weak' ? 'visible' : 'hidden'
            });
            $scope.s2UpBad.attr({
                visibility: commsData.sband.up2 == 'Bad' ? 'visible' : 'hidden'
            });
            $scope.s1DownWeak.attr({
                visibility: commsData.sband.down1 == 'Weak' ? 'visible' : 'hidden'
            });
            $scope.s1DownBad.attr({
                visibility: commsData.sband.down1 == 'Bad' ? 'visible' : 'hidden'
            });
            $scope.s2DownWeak.attr({
                visibility: commsData.sband.down2 == 'Weak' ? 'visible' : 'hidden'
            });
            $scope.s2DownBad.attr({
                visibility: commsData.sband.down2 == 'Bad' ? 'visible' : 'hidden'
            });

            $scope.ku1UpWeak.attr({
                visibility: commsData.kuband.up1 == 'Weak' ? 'visible' : 'hidden'
            });
            $scope.ku1UpBad.attr({
                visibility: commsData.kuband.up1 == 'Bad' ? 'visible' : 'hidden'
            });
            $scope.ku2UpWeak.attr({
                visibility: commsData.kuband.up2 == 'Weak' ? 'visible' : 'hidden'
            });
            $scope.ku2UpBad.attr({
                visibility: commsData.kuband.up2 == 'Bad' ? 'visible' : 'hidden'
            });
            $scope.ku1DownWeak.attr({
                visibility: commsData.kuband.down1 == 'Weak' ? 'visible' : 'hidden'
            });
            $scope.ku1DownBad.attr({
                visibility: commsData.kuband.down1 == 'Bad' ? 'visible' : 'hidden'
            });
            $scope.ku2DownWeak.attr({
                visibility: commsData.kuband.down2 == 'Weak' ? 'visible' : 'hidden'
            });
            $scope.ku2DownBad.attr({
                visibility: commsData.kuband.down2 == 'Bad' ? 'visible' : 'hidden'
            });
        }

        $scope.drawOutages = function (info) {
            $scope.aosSnap = Snap("#aos");
            var paper = $scope.aosSnap.select("#main");

            var leftOut = moment().subtract(11, 'minutes');
            var rightOut = moment().add(55, 'minutes');
            var dx = 5.5;

            var currentOuts = [];

            for (var i = 0; i < info.length; i++) {
                var outStart = moment(info[i].date + " " + info[i].startTime, "DD/MM/YYYY HH:mm");
                var outEnd = moment(info[i].date + " " + info[i].endTime, "DD/MM/YYYY HH:mm");
                if (outStart.isBetween(leftOut, rightOut) || outEnd.isBetween(leftOut, rightOut)) {
                    var x1 = moment.range(leftOut, outStart).diff('minutes') * dx;
                    var x2 = moment.range(outStart, outEnd).diff('minutes') * dx;
                    currentOuts.push({start: x1, end: x2});
                }
            }

            var startX = 0;

            for (var j = 0; j < currentOuts.length; j++) {
                var rect = paper.rect(startX, 26, currentOuts[j].start, 19);
                rect.attr({
                    fill: '#2094FA',
                    rx: 10
                });

                var text = paper.text((startX + 6), 43, info.band);
                text.attr({
                    'font-family': 'Open Sans',
                    'font-size': '20px',
                    'font-weight': '900',
                    fill: '#000'
                });

                startX += (currentOuts[j].start + currentOuts[j].end);
            }

            if (startX < 480) {
                rect = paper.rect(startX, 26, 481 - startX, 19);
                rect.attr({
                    fill: '#2094FA',
                    rx: 10
                });
                var text = paper.text((startX + 6), 43, "S");
                text.attr({
                    'font-family': 'Open Sans',
                    'font-size': '20px',
                    'font-weight': '900',
                    fill: '#000'
                });

            }
        }
    });