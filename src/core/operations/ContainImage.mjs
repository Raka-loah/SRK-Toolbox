/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 *
 * Modified by Raka-loah@github for zh-CN i18n
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { isImage } from "../lib/FileType.mjs";
import { toBase64 } from "../lib/Base64.mjs";
import { isWorkerEnvironment } from "../Utils.mjs";
import Jimp from "jimp/es/index.js";

/**
 * Contain Image operation
 */
class ContainImage extends Operation {

    /**
     * ContainImage constructor
     */
    constructor() {
        super();

        this.name = "容纳图像";
        this.module = "Image";
        this.description = "将图像维持纵横比缩放并完整放置在指定宽高的图像区域中。图像可能会出现黑边。";
        this.infoURL = "";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.presentType = "html";
        this.args = [
            {
                name: "宽",
                type: "number",
                value: 100,
                min: 1
            },
            {
                name: "高",
                type: "number",
                value: 100,
                min: 1
            },
            {
                name: "水平对齐",
                type: "option",
                value: [
                    "左对齐",
                    "居中",
                    "右对齐"
                ],
                defaultIndex: 1
            },
            {
                name: "垂直对齐",
                type: "option",
                value: [
                    "顶端",
                    "中间",
                    "底端"
                ],
                defaultIndex: 1
            },
            {
                name: "缩放插值算法",
                type: "option",
                value: [
                    "临近",
                    "双线性",
                    "双三次",
                    "Hermite",
                    "Bezier"
                ],
                defaultIndex: 1
            },
            {
                name: "不透明背景",
                type: "boolean",
                value: true
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    async run(input, args) {
        const [width, height, hAlign, vAlign, alg, opaqueBg] = args;

        const resizeMap = {
            "临近": Jimp.RESIZE_NEAREST_NEIGHBOR,
            "双线性": Jimp.RESIZE_BILINEAR,
            "双三次": Jimp.RESIZE_BICUBIC,
            "Hermite": Jimp.RESIZE_HERMITE,
            "Bezier": Jimp.RESIZE_BEZIER
        };

        const alignMap = {
            "左对齐": Jimp.HORIZONTAL_ALIGN_LEFT,
            "居中": Jimp.HORIZONTAL_ALIGN_CENTER,
            "右对齐": Jimp.HORIZONTAL_ALIGN_RIGHT,
            "顶端": Jimp.VERTICAL_ALIGN_TOP,
            "中间": Jimp.VERTICAL_ALIGN_MIDDLE,
            "底端": Jimp.VERTICAL_ALIGN_BOTTOM
        };

        if (!isImage(input)) {
            throw new OperationError("无效的文件类型。");
        }

        let image;
        try {
            image = await Jimp.read(input);
        } catch (err) {
            throw new OperationError(`载入图像出错：(${err})`);
        }
        try {
            if (isWorkerEnvironment())
                self.sendStatusMessage("容纳图像……");
            image.contain(width, height, alignMap[hAlign] | alignMap[vAlign], resizeMap[alg]);

            if (opaqueBg) {
                const newImage = await Jimp.read(width, height, 0x000000FF);
                newImage.blit(image, 0, 0);
                image = newImage;
            }

            let imageBuffer;
            if (image.getMIME() === "image/gif") {
                imageBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
            } else {
                imageBuffer = await image.getBufferAsync(Jimp.AUTO);
            }
            return imageBuffer.buffer;
        } catch (err) {
            throw new OperationError(`容纳图像出错：(${err})`);
        }
    }

    /**
     * Displays the contained image using HTML for web apps
     * @param {ArrayBuffer} data
     * @returns {html}
     */
    present(data) {
        if (!data.byteLength) return "";
        const dataArray = new Uint8Array(data);

        const type = isImage(dataArray);
        if (!type) {
            throw new OperationError("无效的文件类型。");
        }

        return `<img src="data:${type};base64,${toBase64(dataArray)}">`;
    }

}

export default ContainImage;
