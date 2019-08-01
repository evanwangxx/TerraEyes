// util.js
// map-util library for TerraEyes
// (c) 2019 Hongbo Wang
// Copyright © 1998 - 2019 Tencent. All Rights Reserved.

function setVisibleOption(object, actionUnit, actionType) {
    qq.maps.event.addDomListener(object, actionType, function () {
        if (actionUnit.getVisible()) {
            actionUnit.setVisible(false);
        } else {
            actionUnit.setVisible(true);
        }
    });
}