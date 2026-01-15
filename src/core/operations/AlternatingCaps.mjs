/**
 * @author sw5678
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 *
 * Modified by Raka-loah@github for zh-CN i18n
 */

import Operation from "../Operation.mjs";

/**
 * Alternating caps operation
 */
class AlternatingCaps extends Operation {

    /**
     * AlternatingCaps constructor
     */
    constructor() {
        super();

        this.name = "交替大小写";
        this.module = "Default";
        this.description = "交替大小写（亦称驼峰大小写混合、粘滞大小写或海绵大小写）是一种文本表示形式，其字母的大小写根据特定模式或随机规则交替变化。例如，将“alternating caps”一词拼写为“aLtErNaTiNg CaPs”。";
        this.infoURL = "https://en.wikipedia.org/wiki/Alternating_caps";
        this.inputType = "string";
        this.outputType = "string";
        this.args= [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        let output = "";
        let previousCaps = true;
        for (let i = 0; i < input.length; i++) {
            // Check if the element is a letter
            if (!RegExp(/^\p{L}/, "u").test(input[i])) {
                output += input[i];
            } else if (previousCaps) {
                output += input[i].toLowerCase();
                previousCaps = false;
            } else {
                output += input[i].toUpperCase();
                previousCaps = true;
            }
        }
        return output;
    }
}

export default AlternatingCaps;
