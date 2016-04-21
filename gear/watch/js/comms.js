angular.module('Watch')
    .controller('CommsCtrl', function ($rootScope, $scope, Api) {
        $scope.colorGood = '#1EDF7A';
        $scope.colorWeak = '#FFE620';
        $scope.colorBad = '#FC3D21';

        $scope.onInitMainSvg = function () {
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
            $scope.ku1DownWeak = $scope.commsSnap.select("#ku-one-bottom-yellow");
            $scope.ku1DownBad = $scope.commsSnap.select("#ku-one-bottom-red");
            $scope.ku2DownWeak = $scope.commsSnap.select("#ku-two-bottom-yellow");
            $scope.ku2DownBad = $scope.commsSnap.select("#ku-two-bottom-red");

        };

        $rootScope.$on('push', function (event, message) {
            $scope.refreshComms();
        });

        $rootScope.$on('refresh', function () {
            $scope.refreshComms();
        });

        $scope.onInitNetworksSvg = function () {
            var networksSnap = Snap("#networks");
            $scope.oca = networksSnap.select("#OCA");
            $scope.iac = networksSnap.select("#IAC");
            $scope.refreshComms();
        };

        $scope.refreshComms = function () {
            Api.comms.get(function (commsData) {
                if($scope.commsSnap) {
                    $scope.updateMainComms(commsData.comms);
                    $scope.updateNetworks(commsData.comms);
                    $scope.drawOutages(commsData.comms.outages)
                }
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
        };

        $scope.drawOutages = function (info) {
            $scope.aosSnap = Snap("#aos");
            var paper = $scope.aosSnap.select("#out");

            var leftOut = moment().subtract(11, 'minutes');
            var rightOut = moment().add(55, 'minutes');
            var dx = 5.5;

            var currentOuts = [];

            if (!info || info.length == 0) {
                $scope.drawHealthyBand(paper, -10, "Ku");
                $scope.drawHealthyBand(paper, -10, "S");
            }

            for (var i = 0; i < info.length; i++) {
                var outStart = moment(info[i].date + " " + info[i].startTime, "MM/DD/YYYY HH:mm");
                var outEnd = moment(info[i].date + " " + info[i].endTime, "MM/DD/YYYY HH:mm");
                if (outStart.isBetween(leftOut, rightOut) || outEnd.isBetween(leftOut, rightOut) ||
                    (outStart.isBefore(leftOut) && outEnd.isAfter(rightOut))) {
                    var x1 = moment.range(leftOut, outStart).diff('minutes') * dx;
                    var x2 = moment.range(outStart, outEnd).diff('minutes') * dx;
                    currentOuts.push({start: x1, end: x2, band: info[i].band});
                }
            }

            $scope.processBandOutages(paper, currentOuts, 'Ku');
            $scope.processBandOutages(paper, currentOuts, 'S');
        };

        $scope.processBandOutages = function (paper, outages, band) {
            var bandOutages = outages.filter(function (value) {
                return value.band == band;
            });

            if (bandOutages.length != 0) {
                var startX = 0;

                for (var j = 0; j < bandOutages.length; j++) {
                    $scope.drawBandOutage(paper, startX, bandOutages[j], band);
                    startX += (bandOutages[j].start + bandOutages[j].end);
                }

                if (startX < 480) {
                    $scope.drawHealthyBand(paper, startX, band);
                }
            } else {
                $scope.drawHealthyBand(paper, -10, band);
            }
        };

        $scope.drawBandOutage = function (paper, startX, outage, band) {
            var top = band == 'Ku' ? 5 : 29;

            var rect = paper.rect(startX, top, outage.start, 19);
            rect.attr({
                fill: '#2094FA',
                rx: 10
            });

            var text = paper.text((startX + 16), top + 15, band);
            text.attr({
                'font-family': 'Open Sans',
                'font-size': '18px',
                'font-weight': '900',
                fill: '#000'
            });

        };

        $scope.drawHealthyBand = function (paper, startX, bandName) {
            var topOffset = bandName == 'Ku' ? 5 : 29;
            var rect = paper.rect(startX, topOffset, 481 - startX, 16);
            rect.attr({
                fill: '#2094FA',
                rx: 10
            });
            var text = paper.text((startX + 26), topOffset + 15, bandName);
            text.attr({
                'font-family': 'Open Sans',
                'font-size': '18px',
                'font-weight': '900',
                fill: '#000'
            });
        }
    });