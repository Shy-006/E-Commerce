"use strict";
// File generated from our OpenAPI spec
Object.defineProperty(exports, "__esModule", { value: true });
exports.Associations = void 0;
const StripeResource_js_1 = require("../../StripeResource.js");
const stripeMethod = StripeResource_js_1.StripeResource.method;
exports.Associations = StripeResource_js_1.StripeResource.extend({
    find: stripeMethod({ method: 'GET', fullPath: '/v1/tax/associations/find' }),
});
