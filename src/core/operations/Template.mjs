/**
 * @author kendallgoto [k@kgo.to]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 *
 * Modified by Raka-loah@github for zh-CN i18n
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Handlebars from "handlebars";

/**
 * Template operation
 */
class Template extends Operation {

    /**
     * Template constructor
     */
    constructor() {
        super();

        this.name = "模板渲染";
        this.module = "Handlebars";
        this.description = "使用Handlebars/Mustache模板引擎，通过JSON输入数据替换变量并渲染模板。模板渲染结果将仅输出纯文本，以防止跨站脚本攻击。";
        this.infoURL = "https://handlebarsjs.com/";
        this.inputType = "JSON";
        this.outputType = "string";
        this.args = [
            {
                name: "模板定义（.handlebars）",
                type: "text",
                value: ""
            }
        ];
    }

    /**
     * @param {JSON} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [templateStr] = args;
        try {
            const template = Handlebars.compile(templateStr);
            return template(input);
        } catch (e) {
            throw new OperationError(e);
        }
    }
}

export default Template;
