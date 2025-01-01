// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unused imports
import {Call as $Call, Create as $Create} from "@wailsio/runtime";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unused imports
import * as grpcmd$0 from "./internal/grpcmd/models.js";

export function CallWithResult(address: string, method: string, req: string): Promise<grpcmd$0.Result> & { cancel(): void } {
    let $resultPromise = $Call.ByID(913647537, address, method, req) as any;
    let $typingPromise = $resultPromise.then(($result: any) => {
        return $$createType0($result);
    }) as any;
    $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
    return $typingPromise;
}

export function MethodTemplate(address: string, method: string): Promise<string> & { cancel(): void } {
    let $resultPromise = $Call.ByID(3477185463, address, method) as any;
    return $resultPromise;
}

export function NonambiguousMethods(address: string): Promise<string[]> & { cancel(): void } {
    let $resultPromise = $Call.ByID(2002104549, address) as any;
    let $typingPromise = $resultPromise.then(($result: any) => {
        return $$createType1($result);
    }) as any;
    $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
    return $typingPromise;
}

// Private type creation functions
const $$createType0 = grpcmd$0.Result.createFrom;
const $$createType1 = $Create.Array($Create.Any);
