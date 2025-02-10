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
Object.defineProperty(exports, "__esModule", { value: true });
const ncsbe_1 = require("./lib/ncsbe");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const ncsbe = new ncsbe_1.NCSBE("2024-11-05");
        yield ncsbe.initialize();
        console.log(ncsbe["dataSet"]); // Direct access workaround if needed
        const contests = ncsbe.listContests();
        console.log(contests[0]);
        console.log(ncsbe.listCandidates(contests[0]));
    });
}
main();
