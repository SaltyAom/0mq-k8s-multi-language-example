"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.createUsagi = exports.Channel = void 0;
var usagi_mq_1 = __importDefault(require("usagi-mq"));
var Exchange;
(function (Exchange) {
    Exchange["rpc"] = "fastify_rpc";
})(Exchange || (Exchange = {}));
var Channel;
(function (Channel) {
    Channel["database"] = "database_engine";
})(Channel = exports.Channel || (exports.Channel = {}));
var createUsagi = function () { return __awaiter(void 0, void 0, void 0, function () {
    var usagi, channel;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                usagi = new usagi_mq_1.default('amqp://localhost');
                return [4 /*yield*/, usagi.connect()];
            case 1:
                _a.sent();
                channel = usagi.createChannel({
                    exchanges: [{ name: Exchange.rpc, durable: false }],
                    queues: [{ name: Channel.database, bindTo: [Exchange.rpc] }]
                });
                return [2 /*return*/, channel];
        }
    });
}); };
exports.createUsagi = createUsagi;
var cluster_1 = __importDefault(require("cluster"));
var os_1 = require("os");
var available = os_1.cpus().length / 2;
var run = function (app) {
    if (process.env.NODE_ENV !== 'production')
        return app();
    if (cluster_1.default.isMaster)
        for (var node = 0; node < available; node++)
            cluster_1.default.fork();
    else
        app();
};
exports.run = run;
//# sourceMappingURL=services.js.map