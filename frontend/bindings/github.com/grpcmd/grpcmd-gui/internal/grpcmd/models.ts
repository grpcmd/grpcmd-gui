// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unused imports
import {Create as $Create} from "@wailsio/runtime";

export class Result {
    "Headers": { [_: string]: string };
    "Messages": string[];
    "Trailers": { [_: string]: string };

    /** Creates a new Result instance. */
    constructor($$source: Partial<Result> = {}) {
        if (!("Headers" in $$source)) {
            this["Headers"] = {};
        }
        if (!("Messages" in $$source)) {
            this["Messages"] = [];
        }
        if (!("Trailers" in $$source)) {
            this["Trailers"] = {};
        }

        Object.assign(this, $$source);
    }

    /**
     * Creates a new Result instance from a string or object.
     */
    static createFrom($$source: any = {}): Result {
        const $$createField0_0 = $$createType0;
        const $$createField1_0 = $$createType1;
        const $$createField2_0 = $$createType0;
        let $$parsedSource = typeof $$source === 'string' ? JSON.parse($$source) : $$source;
        if ("Headers" in $$parsedSource) {
            $$parsedSource["Headers"] = $$createField0_0($$parsedSource["Headers"]);
        }
        if ("Messages" in $$parsedSource) {
            $$parsedSource["Messages"] = $$createField1_0($$parsedSource["Messages"]);
        }
        if ("Trailers" in $$parsedSource) {
            $$parsedSource["Trailers"] = $$createField2_0($$parsedSource["Trailers"]);
        }
        return new Result($$parsedSource as Partial<Result>);
    }
}

// Private type creation functions
const $$createType0 = $Create.Map($Create.Any, $Create.Any);
const $$createType1 = $Create.Array($Create.Any);