/**
 * https://stackoverflow.com/questions/13407348/table-cellindex-and-rowindex-with-colspan-rowspan/13426773
 * Based on answer by ZitRo (https://stackoverflow.com/users/2590150/zitro)
 * Returns the cell of the table by given (x;y) coordinates considering colSpan and rowSpan of the cells.
 * @param {HTMLElement} table - HTML table
 * @param {number} x - X (column) position in table matrix
 * @param {number} y - Y (row) position in table matrix
 * @returns {HTMLElement|null}
 */
var getTableCell = function (table, x, y) {
    var m = [], row, cell, xx, tx, ty, xxx, yyy;
    for (yyy = 0; yyy < table.rows.length; yyy++) {
        row = table.rows[yyy];
        for (xxx = 0; xxx < row.cells.length; xxx++) {
            cell = row.cells[xxx];
            xx = xxx;
            for (; m[yyy] && m[yyy][xx]; ++xx) { }
            for (tx = xx; tx < xx + cell.colSpan; ++tx) {
                for (ty = yyy; ty < yyy + cell.rowSpan; ++ty) {
                    if (!m[ty])
                        m[ty] = [];
                    m[ty][tx] = true;
                }
            }
            if (xx <= x && x < xx + cell.colSpan && yyy <= y && y < yyy + cell.rowSpan)
                return cell;
        }
    }
    return null;
};

window.getTableCell = getTableCell;