/**
 * @author jb30795 [jb30795@proton.me]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 *
 * Modified by Raka-loah@github for zh-CN i18n
 */

import Operation from "../Operation.mjs";

/**
 * IPv6 Transition Addresses operation
 */
class IPv6TransitionAddresses extends Operation {

    /**
     * IPv6TransitionAddresses constructor
     */
    constructor() {
        super();

        this.name = "IPv6过渡地址";
        this.module = "Default";
        this.description = "将IPv4地址转换为其IPv6过渡地址，亦可反向将IPv6过渡地址还原为原始IPv4地址。同时支持将MAC地址转换为EUI-64格式，该格式可直接附加至您的IPv6 /64地址段，从而生成完整的/128地址。过渡技术通过实现IPv4与IPv6地址间的转换或建立隧道，使流量能在不兼容的网络间传输，从而实现两种标准的共存。当前仅支持处理/24地址范围。提供“移除标头”功能，便于直接复制输出结果。";
        this.infoURL = "https://wikipedia.org/wiki/IPv6_transition_mechanism";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
	    {
                "name": "忽略地址范围",
                "type": "boolean",
	        "value": true
	    },
            {
                "name": "移除标头",
                "type": "boolean",
                "value": false
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const XOR = {"0": "2", "1": "3", "2": "0", "3": "1", "4": "6", "5": "7", "6": "4", "7": "5", "8": "a", "9": "b", "a": "8", "b": "9", "c": "e", "d": "f", "e": "c", "f": "d"};

        /**
	 * Function to convert to hex
	 */
        function hexify(octet) {
            return Number(octet).toString(16).padStart(2, "0");
        }

        /**
	 * Function to convert Hex to Int
	 */
        function intify(hex) {
            return parseInt(hex, 16);
        }

        /**
	 * Function converts IPv4 to IPv6 Transtion address
	 */
        function ipTransition(input, range) {
            let output = "";
            const HEXIP = input.split(".");

            /**
	     * 6to4
	     */
            if (!args[1]) {
                output += "6to4：";
            }
            output += "2002:" + hexify(HEXIP[0]) + hexify(HEXIP[1]) + ":" + hexify(HEXIP[2]);
            if (range) {
                output += "00::/40\n";
            } else {
                output += hexify(HEXIP[3]) + "::/48\n";
            }

            /**
	     * Mapped
	     */
            if (!args[1]) {
                output += "IPv4映射：";
            }
            output += "::ffff:" + hexify(HEXIP[0]) + hexify(HEXIP[1]) + ":" + hexify(HEXIP[2]);
            if (range) {
                output += "00/120\n";
            } else {
                output += hexify(HEXIP[3]) + "\n";
            }

            /**
	     * Translated
	     */
            if (!args[1]) {
                output += "IPv4转译：";
            }
            output += "::ffff:0:" + hexify(HEXIP[0]) + hexify(HEXIP[1]) + ":" + hexify(HEXIP[2]);
            if (range) {
                output += "00/120\n";
            } else {
                output += hexify(HEXIP[3]) + "\n";
            }

            /**
	     * Nat64
	     */
            if (!args[1]) {
                output += "NAT64：";
            }
            output += "64:ff9b::" + hexify(HEXIP[0]) + hexify(HEXIP[1]) + ":" + hexify(HEXIP[2]);
            if (range) {
                output += "00/120\n";
            } else {
                output += hexify(HEXIP[3]) + "\n";
            }

            return output;
        }

        /**
	 * Convert MAC to EUI-64
	 */
        function macTransition(input) {
            let output = "";
            const MACPARTS = input.split(":");
            if (!args[1]) {
                output += "EUI-64接口标识符：";
            }
            const MAC = MACPARTS[0] + MACPARTS[1] + ":" + MACPARTS[2] + "ff:fe" + MACPARTS[3] + ":" + MACPARTS[4] + MACPARTS[5];
            output += MAC.slice(0, 1) + XOR[MAC.slice(1, 2)] + MAC.slice(2);

            return output;
        }


        /**
	 * Convert IPv6 address to its original IPv4 or MAC address
	 */
        function unTransition(input) {
            let output = "";
            let hextets = "";

            /**
	     * 6to4
	     */
            if (input.startsWith("2002:")) {
                if (!args[1]) {
                    output += "IPv4：";
                }
                output += String(intify(input.slice(5, 7))) + "." + String(intify(input.slice(7, 9)))+ "." + String(intify(input.slice(10, 12)))+ "." + String(intify(input.slice(12, 14))) + "\n";
            } else if (input.startsWith("::ffff:") || input.startsWith("0000:0000:0000:0000:0000:ffff:") || input.startsWith("::ffff:0000:") || input.startsWith("0000:0000:0000:0000:ffff:0000:") || input.startsWith("64:ff9b::") || input.startsWith("0064:ff9b:0000:0000:0000:0000:")) {
		/**
		 * Mapped/Translated/Nat64
		 */
                hextets = /:([0-9a-z]{1,4}):[0-9a-z]{1,4}$/.exec(input)[1].padStart(4, "0") + /:([0-9a-z]{1,4})$/.exec(input)[1].padStart(4, "0");
                if (!args[1]) {
                    output += "IPv4：";
                }
                output += intify(hextets.slice(-8, -7) +  hextets.slice(-7, -6)) + "." +intify(hextets.slice(-6, -5) +  hextets.slice(-5, -4)) + "." +intify(hextets.slice(-4, -3) +  hextets.slice(-3, -2)) + "." +intify(hextets.slice(-2, -1) +  hextets.slice(-1,)) + "\n";
            } else if (input.slice(-12, -7).toUpperCase() === "FF:FE") {
		/**
		 * EUI-64
		 */
                if (!args[1]) {
                    output += "MAC地址：";
                }
                const MAC = (input.slice(-19, -17) + ":" + input.slice(-17, -15) + ":" + input.slice(-14, -12) + ":" + input.slice(-7, -5) + ":" + input.slice(-4, -2) + ":" + input.slice(-2,)).toUpperCase();
                output += MAC.slice(0, 1) + XOR[MAC.slice(1, 2)] + MAC.slice(2) + "\n";
            }

            return output;
        }


        /**
	 * Main
	 */
        let output = "";
        let inputs = input.split("\n");
        // Remove blank rows
        inputs = inputs.filter(Boolean);

        for (let i = 0; i < inputs.length; i++) {
            // if ignore ranges is checked and input is a range, skip
            if ((args[0] && !inputs[i].includes("/")) || (!args[0])) {
                if (/^[0-9]{1,3}(?:\.[0-9]{1,3}){3}$/.test(inputs[i])) {
                    output += ipTransition(inputs[i], false);
                } else if (/\/24$/.test(inputs[i])) {
                    output += ipTransition(inputs[i], true);
                } else if (/^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/.test(inputs[i])) {
                    output += macTransition(inputs[i]);
                } else if (/^((?:[0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(?:ffff(?::0{1,4}){0,1}:){0,1}(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])|(?:[0-9a-fA-F]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/.test(inputs[i])) {
                    output += unTransition(inputs[i]);
                } else {
                    output = "请输入压缩或原始格式的IPv6、IPv4或MAC地址。";
                }
            }
        }

        return output;
    }

}

export default IPv6TransitionAddresses;
