/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

console.log('loading tool.js');
const { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(this, "EventEmitter",
  "resource://gre/modules/devtools/event-emitter.js");
XPCOMUtils.defineLazyModuleGetter(this, "promise",
  "resource://gre/modules/commonjs/sdk/core/promise.js", "Promise");

const {devtools} = Cu.import("resource://gre/modules/devtools/Loader.jsm", {});
const {require} = devtools;
const protocol = require("resource://gre/modules/devtools/server/protocol.js");
XPCOMUtils.defineLazyGetter(this, "StyleSheetsFront",
  () => require("resource://gre/modules/devtools/server/actors/stylesheets.js").StyleSheetsFront);

/**
 * This file has access to the `window` and `document` objects of the add-on's
 * iframe, and is included in tool.xul. This is the add-on's controller.
 */

/**
 * Our internal Controller
 */
var MockL10nController = {
  toolbox: null,
  localize: function() {
    var targetPromise, target = this.toolbox.target;
    // XXX assume local for now
    targetPromise = target.makeRemote();
    targetPromise.then(() => {
      console.log('target', target);
      var debuggee = StyleSheetsFront(target.client, target.form);
      debuggee.getStyleSheets().then((styleSheets) => {
        console.log(styleSheets);
        //debuggee.destroy();
      });
    });
  }
};

/**
 * Called when the user select the tool tab.
 *
 * @param Toolbox toolbox
 *        The developer tools toolbox, containing all tools.
 * @param object target
 *        The local or remote target being debugged.
 * @return object
 *         A promise that should be resolved when the tool completes opening.
 */
function startup(toolbox, target) {
  MockL10nController.toolbox = toolbox;
  var button = document.querySelector('#localize');
  button.disabled = false;
  button.onclick = MockL10nController.localize.bind(MockL10nController);
  return promise.resolve();
}

/**
 * Called when the user closes the toolbox or disables the add-on.
 *
 * @return object
 *         A promise that should be resolved when the tool completes closing.
 */
function shutdown() {
  var button = document.querySelector('#localize');
  button.onclick = null;
  return promise.resolve();
}

