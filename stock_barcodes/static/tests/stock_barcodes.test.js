import {afterEach, expect, test} from "@odoo/hoot";
import {StockBarcodesMainMenu} from "../src/views/actions/stock_barcode_main_menu.esm";
import {isAllowedBarcodeModel} from "../src/utils/barcodes_models_utils.esm";
import {waitVisibleElement} from "../src/utils/wait_visible_elment_helper.esm";

test.tags("headless");

afterEach(() => {
    document.body.replaceChildren();
});

test("barcode models are restricted to supported models", () => {
    expect(isAllowedBarcodeModel("stock.picking")).toBe(true);
    expect(isAllowedBarcodeModel("wiz.stock.barcodes.read.picking")).toBe(true);
    expect(isAllowedBarcodeModel("res.partner")).toBe(false);
});

test("waitVisibleElement resolves an existing visible element", async () => {
    const element = document.createElement("input");
    element.className = "barcode-test-input";
    element.getBoundingClientRect = () => ({
        width: 10,
        height: 10,
        top: 0,
        right: 10,
        bottom: 10,
        left: 0,
    });
    document.body.appendChild(element);

    const result = await waitVisibleElement(".barcode-test-input", 50);

    expect(result).toBe(element);
});

test("main menu sends scanned barcode to the barcode wizard", async () => {
    const calls = [];
    const mainMenu = {
        ormService: {
            call: async (...args) => {
                calls.push(args);
            },
        },
    };

    await StockBarcodesMainMenu.prototype._onBarcodeScanned.call(
        mainMenu,
        "0123456789012"
    );

    expect(calls).toEqual([
        ["wiz.stock.barcodes.read", "process_barcode", [[], "0123456789012"]],
    ]);
});
