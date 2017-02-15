/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { APP_ID, Inject, Injectable, NgZone, ViewEncapsulation } from '@angular/core';
import { AnimationDriver, DOCUMENT } from '@angular/platform-browser';
import { isBlank, isPresent, stringify } from './facade/lang';
import { NAMESPACE_URIS, SharedStylesHost, flattenStyles, getDOM, isNamespaced, shimContentAttribute, shimHostAttribute, splitNamespace } from './private_import_platform-browser';
var /** @type {?} */ TEMPLATE_COMMENT_TEXT = 'template bindings={}';
var /** @type {?} */ TEMPLATE_BINDINGS_EXP = /^template bindings=(.*)$/;
var ServerRootRenderer = (function () {
    /**
     * @param {?} document
     * @param {?} sharedStylesHost
     * @param {?} animationDriver
     * @param {?} appId
     * @param {?} _zone
     */
    function ServerRootRenderer(document, sharedStylesHost, animationDriver, appId, _zone) {
        this.document = document;
        this.sharedStylesHost = sharedStylesHost;
        this.animationDriver = animationDriver;
        this.appId = appId;
        this._zone = _zone;
        this.registeredComponents = new Map();
    }
    /**
     * @param {?} componentProto
     * @return {?}
     */
    ServerRootRenderer.prototype.renderComponent = function (componentProto) {
        var /** @type {?} */ renderer = this.registeredComponents.get(componentProto.id);
        if (!renderer) {
            renderer = new ServerRenderer(this, componentProto, this.animationDriver, this.appId + "-" + componentProto.id, this._zone);
            this.registeredComponents.set(componentProto.id, renderer);
        }
        return renderer;
    };
    return ServerRootRenderer;
}());
export { ServerRootRenderer };
ServerRootRenderer.decorators = [
    { type: Injectable },
];
/** @nocollapse */
ServerRootRenderer.ctorParameters = function () { return [
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] },] },
    { type: SharedStylesHost, },
    { type: AnimationDriver, },
    { type: undefined, decorators: [{ type: Inject, args: [APP_ID,] },] },
    { type: NgZone, },
]; };
function ServerRootRenderer_tsickle_Closure_declarations() {
    /** @type {?} */
    ServerRootRenderer.decorators;
    /**
     * @nocollapse
     * @type {?}
     */
    ServerRootRenderer.ctorParameters;
    /** @type {?} */
    ServerRootRenderer.prototype.registeredComponents;
    /** @type {?} */
    ServerRootRenderer.prototype.document;
    /** @type {?} */
    ServerRootRenderer.prototype.sharedStylesHost;
    /** @type {?} */
    ServerRootRenderer.prototype.animationDriver;
    /** @type {?} */
    ServerRootRenderer.prototype.appId;
    /** @type {?} */
    ServerRootRenderer.prototype._zone;
}
var ServerRenderer = (function () {
    /**
     * @param {?} _rootRenderer
     * @param {?} componentProto
     * @param {?} _animationDriver
     * @param {?} styleShimId
     * @param {?} _zone
     */
    function ServerRenderer(_rootRenderer, componentProto, _animationDriver, styleShimId, _zone) {
        this._rootRenderer = _rootRenderer;
        this.componentProto = componentProto;
        this._animationDriver = _animationDriver;
        this._zone = _zone;
        this._styles = flattenStyles(styleShimId, componentProto.styles, []);
        if (componentProto.encapsulation === ViewEncapsulation.Native) {
            throw new Error('Native encapsulation is not supported on the server!');
        }
        if (this.componentProto.encapsulation === ViewEncapsulation.Emulated) {
            this._contentAttr = shimContentAttribute(styleShimId);
            this._hostAttr = shimHostAttribute(styleShimId);
        }
        else {
            this._contentAttr = null;
            this._hostAttr = null;
        }
    }
    /**
     * @param {?} selectorOrNode
     * @param {?} debugInfo
     * @return {?}
     */
    ServerRenderer.prototype.selectRootElement = function (selectorOrNode, debugInfo) {
        var /** @type {?} */ el /** TODO #9100 */;
        if (typeof selectorOrNode === 'string') {
            el = getDOM().querySelector(this._rootRenderer.document, selectorOrNode);
            if (isBlank(el)) {
                throw new Error("The selector \"" + selectorOrNode + "\" did not match any elements");
            }
        }
        else {
            el = selectorOrNode;
        }
        getDOM().clearNodes(el);
        return el;
    };
    /**
     * @param {?} parent
     * @param {?} name
     * @param {?} debugInfo
     * @return {?}
     */
    ServerRenderer.prototype.createElement = function (parent, name, debugInfo) {
        var /** @type {?} */ el;
        if (isNamespaced(name)) {
            var /** @type {?} */ nsAndName = splitNamespace(name);
            el = getDOM().createElementNS(NAMESPACE_URIS[nsAndName[0]], nsAndName[1]);
        }
        else {
            el = getDOM().createElement(name);
        }
        if (isPresent(this._contentAttr)) {
            getDOM().setAttribute(el, this._contentAttr, '');
        }
        if (isPresent(parent)) {
            getDOM().appendChild(parent, el);
        }
        return el;
    };
    /**
     * @param {?} hostElement
     * @return {?}
     */
    ServerRenderer.prototype.createViewRoot = function (hostElement) {
        var /** @type {?} */ nodesParent /** TODO #9100 */;
        if (isPresent(this._hostAttr)) {
            getDOM().setAttribute(hostElement, this._hostAttr, '');
        }
        nodesParent = hostElement;
        return nodesParent;
    };
    /**
     * @param {?} parentElement
     * @param {?} debugInfo
     * @return {?}
     */
    ServerRenderer.prototype.createTemplateAnchor = function (parentElement, debugInfo) {
        var /** @type {?} */ comment = getDOM().createComment(TEMPLATE_COMMENT_TEXT);
        if (isPresent(parentElement)) {
            getDOM().appendChild(parentElement, comment);
        }
        return comment;
    };
    /**
     * @param {?} parentElement
     * @param {?} value
     * @param {?} debugInfo
     * @return {?}
     */
    ServerRenderer.prototype.createText = function (parentElement, value, debugInfo) {
        var /** @type {?} */ node = getDOM().createTextNode(value);
        if (isPresent(parentElement)) {
            getDOM().appendChild(parentElement, node);
        }
        return node;
    };
    /**
     * @param {?} parentElement
     * @param {?} nodes
     * @return {?}
     */
    ServerRenderer.prototype.projectNodes = function (parentElement, nodes) {
        if (isBlank(parentElement))
            return;
        appendNodes(parentElement, nodes);
    };
    /**
     * @param {?} node
     * @param {?} viewRootNodes
     * @return {?}
     */
    ServerRenderer.prototype.attachViewAfter = function (node, viewRootNodes) { moveNodesAfterSibling(node, viewRootNodes); };
    /**
     * @param {?} viewRootNodes
     * @return {?}
     */
    ServerRenderer.prototype.detachView = function (viewRootNodes) {
        for (var /** @type {?} */ i = 0; i < viewRootNodes.length; i++) {
            getDOM().remove(viewRootNodes[i]);
        }
    };
    /**
     * @param {?} hostElement
     * @param {?} viewAllNodes
     * @return {?}
     */
    ServerRenderer.prototype.destroyView = function (hostElement, viewAllNodes) { };
    /**
     * @param {?} renderElement
     * @param {?} name
     * @param {?} callback
     * @return {?}
     */
    ServerRenderer.prototype.listen = function (renderElement, name, callback) {
        var _this = this;
        // Note: We are not using the EventsPlugin here as this is not needed
        // to run our tests.
        var /** @type {?} */ outsideHandler = function (event) { return _this._zone.runGuarded(function () { return callback(event); }); };
        return this._zone.runOutsideAngular(function () { return getDOM().onAndCancel(renderElement, name, outsideHandler); });
    };
    /**
     * @param {?} target
     * @param {?} name
     * @param {?} callback
     * @return {?}
     */
    ServerRenderer.prototype.listenGlobal = function (target, name, callback) {
        var /** @type {?} */ renderElement = getDOM().getGlobalEventTarget(this._rootRenderer.document, target);
        return this.listen(renderElement, name, callback);
    };
    /**
     * @param {?} renderElement
     * @param {?} propertyName
     * @param {?} propertyValue
     * @return {?}
     */
    ServerRenderer.prototype.setElementProperty = function (renderElement, propertyName, propertyValue) {
        getDOM().setProperty(renderElement, propertyName, propertyValue);
    };
    /**
     * @param {?} renderElement
     * @param {?} attributeName
     * @param {?} attributeValue
     * @return {?}
     */
    ServerRenderer.prototype.setElementAttribute = function (renderElement, attributeName, attributeValue) {
        var /** @type {?} */ attrNs;
        var /** @type {?} */ attrNameWithoutNs = attributeName;
        if (isNamespaced(attributeName)) {
            var /** @type {?} */ nsAndName = splitNamespace(attributeName);
            attrNameWithoutNs = nsAndName[1];
            attributeName = nsAndName[0] + ':' + nsAndName[1];
            attrNs = NAMESPACE_URIS[nsAndName[0]];
        }
        if (isPresent(attributeValue)) {
            if (isPresent(attrNs)) {
                getDOM().setAttributeNS(renderElement, attrNs, attributeName, attributeValue);
            }
            else {
                getDOM().setAttribute(renderElement, attributeName, attributeValue);
            }
        }
        else {
            if (isPresent(attrNs)) {
                getDOM().removeAttributeNS(renderElement, attrNs, attrNameWithoutNs);
            }
            else {
                getDOM().removeAttribute(renderElement, attributeName);
            }
        }
    };
    /**
     * @param {?} renderElement
     * @param {?} propertyName
     * @param {?} propertyValue
     * @return {?}
     */
    ServerRenderer.prototype.setBindingDebugInfo = function (renderElement, propertyName, propertyValue) {
        if (getDOM().isCommentNode(renderElement)) {
            var /** @type {?} */ existingBindings = getDOM().getText(renderElement).replace(/\n/g, '').match(TEMPLATE_BINDINGS_EXP);
            var /** @type {?} */ parsedBindings = JSON.parse(existingBindings[1]);
            ((parsedBindings) /** TODO #9100 */)[propertyName] = propertyValue;
            getDOM().setText(renderElement, TEMPLATE_COMMENT_TEXT.replace('{}', JSON.stringify(parsedBindings, null, 2)));
        }
        else {
            this.setElementAttribute(renderElement, propertyName, propertyValue);
        }
    };
    /**
     * @param {?} renderElement
     * @param {?} className
     * @param {?} isAdd
     * @return {?}
     */
    ServerRenderer.prototype.setElementClass = function (renderElement, className, isAdd) {
        if (isAdd) {
            getDOM().addClass(renderElement, className);
        }
        else {
            getDOM().removeClass(renderElement, className);
        }
    };
    /**
     * @param {?} renderElement
     * @param {?} styleName
     * @param {?} styleValue
     * @return {?}
     */
    ServerRenderer.prototype.setElementStyle = function (renderElement, styleName, styleValue) {
        if (isPresent(styleValue)) {
            getDOM().setStyle(renderElement, styleName, stringify(styleValue));
        }
        else {
            getDOM().removeStyle(renderElement, styleName);
        }
    };
    /**
     * @param {?} renderElement
     * @param {?} methodName
     * @param {?} args
     * @return {?}
     */
    ServerRenderer.prototype.invokeElementMethod = function (renderElement, methodName, args) {
        getDOM().invoke(renderElement, methodName, args);
    };
    /**
     * @param {?} renderNode
     * @param {?} text
     * @return {?}
     */
    ServerRenderer.prototype.setText = function (renderNode, text) { getDOM().setText(renderNode, text); };
    /**
     * @param {?} element
     * @param {?} startingStyles
     * @param {?} keyframes
     * @param {?} duration
     * @param {?} delay
     * @param {?} easing
     * @param {?=} previousPlayers
     * @return {?}
     */
    ServerRenderer.prototype.animate = function (element, startingStyles, keyframes, duration, delay, easing, previousPlayers) {
        if (previousPlayers === void 0) { previousPlayers = []; }
        return this._animationDriver.animate(element, startingStyles, keyframes, duration, delay, easing, previousPlayers);
    };
    return ServerRenderer;
}());
export { ServerRenderer };
function ServerRenderer_tsickle_Closure_declarations() {
    /** @type {?} */
    ServerRenderer.prototype._contentAttr;
    /** @type {?} */
    ServerRenderer.prototype._hostAttr;
    /** @type {?} */
    ServerRenderer.prototype._styles;
    /** @type {?} */
    ServerRenderer.prototype._rootRenderer;
    /** @type {?} */
    ServerRenderer.prototype.componentProto;
    /** @type {?} */
    ServerRenderer.prototype._animationDriver;
    /** @type {?} */
    ServerRenderer.prototype._zone;
}
/**
 * @param {?} ref
 * @param {?} nodes
 * @return {?}
 */
function moveNodesAfterSibling(ref, nodes) {
    var /** @type {?} */ parent = getDOM().parentElement(ref);
    if (nodes.length > 0 && parent) {
        var /** @type {?} */ nextSibling = getDOM().nextSibling(ref);
        if (nextSibling) {
            for (var /** @type {?} */ i = 0; i < nodes.length; i++) {
                getDOM().insertBefore(parent, nextSibling, nodes[i]);
            }
        }
        else {
            for (var /** @type {?} */ i = 0; i < nodes.length; i++) {
                getDOM().appendChild(parent, nodes[i]);
            }
        }
    }
}
/**
 * @param {?} parent
 * @param {?} nodes
 * @return {?}
 */
function appendNodes(parent, nodes) {
    for (var /** @type {?} */ i = 0; i < nodes.length; i++) {
        getDOM().appendChild(parent, nodes[i]);
    }
}
var ServerRendererV2 = (function () {
    /**
     * @param {?} ngZone
     * @param {?} document
     */
    function ServerRendererV2(ngZone, document) {
        this.ngZone = ngZone;
        this.document = document;
    }
    /**
     * @param {?} name
     * @param {?=} namespace
     * @param {?=} debugInfo
     * @return {?}
     */
    ServerRendererV2.prototype.createElement = function (name, namespace, debugInfo) {
        if (namespace) {
            return getDOM().createElementNS(NAMESPACE_URIS[namespace], name);
        }
        return getDOM().createElement(name);
    };
    /**
     * @param {?} value
     * @param {?=} debugInfo
     * @return {?}
     */
    ServerRendererV2.prototype.createComment = function (value, debugInfo) { return getDOM().createComment(value); };
    /**
     * @param {?} value
     * @param {?=} debugInfo
     * @return {?}
     */
    ServerRendererV2.prototype.createText = function (value, debugInfo) { return getDOM().createTextNode(value); };
    /**
     * @param {?} parent
     * @param {?} newChild
     * @return {?}
     */
    ServerRendererV2.prototype.appendChild = function (parent, newChild) { getDOM().appendChild(parent, newChild); };
    /**
     * @param {?} parent
     * @param {?} newChild
     * @param {?} refChild
     * @return {?}
     */
    ServerRendererV2.prototype.insertBefore = function (parent, newChild, refChild) {
        if (parent) {
            getDOM().insertBefore(parent, refChild, newChild);
        }
    };
    /**
     * @param {?} parent
     * @param {?} oldChild
     * @return {?}
     */
    ServerRendererV2.prototype.removeChild = function (parent, oldChild) {
        if (parent) {
            getDOM().removeChild(parent, oldChild);
        }
    };
    /**
     * @param {?} selectorOrNode
     * @param {?=} debugInfo
     * @return {?}
     */
    ServerRendererV2.prototype.selectRootElement = function (selectorOrNode, debugInfo) {
        var /** @type {?} */ el;
        if (typeof selectorOrNode === 'string') {
            el = getDOM().querySelector(this.document, selectorOrNode);
            if (!el) {
                throw new Error("The selector \"" + selectorOrNode + "\" did not match any elements");
            }
        }
        else {
            el = selectorOrNode;
        }
        getDOM().clearNodes(el);
        return el;
    };
    /**
     * @param {?} node
     * @return {?}
     */
    ServerRendererV2.prototype.parentNode = function (node) { return getDOM().parentElement(node); };
    /**
     * @param {?} node
     * @return {?}
     */
    ServerRendererV2.prototype.nextSibling = function (node) { return getDOM().nextSibling(node); };
    /**
     * @param {?} el
     * @param {?} name
     * @param {?} value
     * @param {?=} namespace
     * @return {?}
     */
    ServerRendererV2.prototype.setAttribute = function (el, name, value, namespace) {
        if (namespace) {
            getDOM().setAttributeNS(el, NAMESPACE_URIS[namespace], namespace + ':' + name, value);
        }
        else {
            getDOM().setAttribute(el, name, value);
        }
    };
    /**
     * @param {?} el
     * @param {?} name
     * @param {?=} namespace
     * @return {?}
     */
    ServerRendererV2.prototype.removeAttribute = function (el, name, namespace) {
        if (namespace) {
            getDOM().removeAttributeNS(el, NAMESPACE_URIS[namespace], name);
        }
        else {
            getDOM().removeAttribute(el, name);
        }
    };
    /**
     * @param {?} el
     * @param {?} propertyName
     * @param {?} propertyValue
     * @return {?}
     */
    ServerRendererV2.prototype.setBindingDebugInfo = function (el, propertyName, propertyValue) {
        if (getDOM().isCommentNode(el)) {
            var /** @type {?} */ m = getDOM().getText(el).replace(/\n/g, '').match(TEMPLATE_BINDINGS_EXP);
            var /** @type {?} */ obj = m === null ? {} : JSON.parse(m[1]);
            obj[propertyName] = propertyValue;
            getDOM().setText(el, TEMPLATE_COMMENT_TEXT.replace('{}', JSON.stringify(obj, null, 2)));
        }
        else {
            this.setAttribute(el, propertyName, propertyValue);
        }
    };
    /**
     * @param {?} el
     * @param {?} propertyName
     * @return {?}
     */
    ServerRendererV2.prototype.removeBindingDebugInfo = function (el, propertyName) {
        if (getDOM().isCommentNode(el)) {
            var /** @type {?} */ m = getDOM().getText(el).replace(/\n/g, '').match(TEMPLATE_BINDINGS_EXP);
            var /** @type {?} */ obj = m === null ? {} : JSON.parse(m[1]);
            delete obj[propertyName];
            getDOM().setText(el, TEMPLATE_COMMENT_TEXT.replace('{}', JSON.stringify(obj, null, 2)));
        }
        else {
            this.removeAttribute(el, propertyName);
        }
    };
    /**
     * @param {?} el
     * @param {?} name
     * @return {?}
     */
    ServerRendererV2.prototype.addClass = function (el, name) { getDOM().addClass(el, name); };
    /**
     * @param {?} el
     * @param {?} name
     * @return {?}
     */
    ServerRendererV2.prototype.removeClass = function (el, name) { getDOM().removeClass(el, name); };
    /**
     * @param {?} el
     * @param {?} style
     * @param {?} value
     * @param {?} hasVendorPrefix
     * @param {?} hasImportant
     * @return {?}
     */
    ServerRendererV2.prototype.setStyle = function (el, style, value, hasVendorPrefix, hasImportant) {
        getDOM().setStyle(el, style, value);
    };
    /**
     * @param {?} el
     * @param {?} style
     * @param {?} hasVendorPrefix
     * @return {?}
     */
    ServerRendererV2.prototype.removeStyle = function (el, style, hasVendorPrefix) {
        getDOM().removeStyle(el, style);
    };
    /**
     * @param {?} el
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    ServerRendererV2.prototype.setProperty = function (el, name, value) { getDOM().setProperty(el, name, value); };
    /**
     * @param {?} node
     * @param {?} value
     * @return {?}
     */
    ServerRendererV2.prototype.setText = function (node, value) { getDOM().setText(node, value); };
    /**
     * @param {?} target
     * @param {?} eventName
     * @param {?} callback
     * @return {?}
     */
    ServerRendererV2.prototype.listen = function (target, eventName, callback) {
        var _this = this;
        // Note: We are not using the EventsPlugin here as this is not needed
        // to run our tests.
        var /** @type {?} */ el = typeof target === 'string' ? getDOM().getGlobalEventTarget(this.document, target) : target;
        var /** @type {?} */ outsideHandler = function (event) { return _this.ngZone.runGuarded(function () { return callback(event); }); };
        return this.ngZone.runOutsideAngular(function () { return getDOM().onAndCancel(el, eventName, outsideHandler); });
    };
    return ServerRendererV2;
}());
export { ServerRendererV2 };
ServerRendererV2.decorators = [
    { type: Injectable },
];
/** @nocollapse */
ServerRendererV2.ctorParameters = function () { return [
    { type: NgZone, },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] },] },
]; };
function ServerRendererV2_tsickle_Closure_declarations() {
    /** @type {?} */
    ServerRendererV2.decorators;
    /**
     * @nocollapse
     * @type {?}
     */
    ServerRendererV2.ctorParameters;
    /** @type {?} */
    ServerRendererV2.prototype.ngZone;
    /** @type {?} */
    ServerRendererV2.prototype.document;
}
//# sourceMappingURL=server_renderer.js.map