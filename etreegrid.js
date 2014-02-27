/**
 * etreegrid - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2013 maddemon [ zhengliangjun@gmail.com ] 
 * 
 * Dependencies:
 *   treegrid
 *   messager
 * 
 */
(function ($) {

    function buildGrid(target) {
        var opts = $.data(target, 'etreegrid').options;
        $(target).treegrid($.extend({}, opts, {
            onDblClickCell: function (field, row) {
                if (opts.editing) {
                    $(this).etreegrid("editRow", row);
                    focusEditor(field);
                }
            },
            onClickCell: function (field, row) {
                if (opts.editId === 0) {
                    if (!trySaveRow()) {
                        focusEditor(field);
                        return;
                    }
                }
            },
            onAfterEdit: function (row, changes) {
                //opts.editId = undefined;
                var url = row.isNewRecord ? opts.saveUrl : opts.updateUrl || opts.saveUrl;
                if (url) {
                    $.post(url, row).done(function (json, statusText, xhr) {
                        console.log(opts.editId)
                        if (opts.editId === 0) {
                            json = eval("(" + json + ")");
                            $(target).treegrid("remove", opts.editId);
                            var data = json.data;
                            console.log(data);
                            $(target).treegrid("append", { parent: data[opts.parentIdField], data: [data] });
                        } else {
                            //refresh
                            $(target).treegrid("refresh", row[opts.idField]);
                        }
                        opts.editId = undefined;
                    }).error(function (xhr) {
                        var result = eval("(" + xhr.responseText + ")");
                        $.messager.alert("失败", result.message || result, "warning");
                    });
                    opts.onSave.call(target, row);
                } else {
                    opts.onSave.call(target, row);
                }
                if (opts.onAfterEdit) opts.onAfterEdit.call(target, row);
            },
            onCancelEdit: function (row) {
                opts.editId = undefined;
                if (row.isNewRecord) {
                    $(this).treegrid("remove", row[opts.idField]);
                }
                if (opts.onCancelEdit) opts.onCancelEdit.call(target, row);
            },
            onBeforeLoad: function (row, param) {
                if (opts.onBeforeLoad.call(target, row, param) == false) {
                    return false;
                };
                $(this).treegrid("rejectChanges");
            }
        }));

        function trySaveRow() {
            if (!$(target).treegrid("validateRow", opts.editId)) {
                $(target).treegrid("select", opts.editId);
                return false;
            }
            if (opts.onBeforeSave.call(this, opts.editId) == false) {
                setTimeout(function () {
                    $(target).treegrid('select', opts.editId);
                }, 0);
                return false;
            }
            $(target).treegrid('endEdit', opts.editId);
            return true;
        }

        function focusEditor(field) {
            var editor = $(target).treegrid('getEditor', { id: opts.editId, field: field });
            if (editor) {
                editor.target.focus();
            } else {
                var editors = $(target).treegrid('getEditors', opts.editId);
                if (editors.length) {
                    editors[0].target.focus();
                }
            }
        }
    }

    $.fn.etreegrid = function (options, param) {
        if (typeof (options) == "string") {
            var method = $.fn.etreegrid.methods[options];
            if (method) {
                return method(this, param);
            } else {
                return this.treegrid(options, param);
            }
        }

        options = options || {};
        return this.each(function () {
            var state = $.data(this, "etreegrid");
            if (state) {
                $.extend(state.options, options);
            } else {
                $.data(this, "etreegrid", { options: $.extend({}, $.fn.etreegrid.defaults, $.fn.etreegrid.parseOptions(this), options) });
            }
            ;
            buildGrid(this);

        });
    };

    $.fn.etreegrid.parseOptions = function (target) {
        return $.extend({}, $.fn.treegrid.parseOptions(target), {});
    };

    $.fn.etreegrid.methods = {
        options: function (jq) {
            var opts = $.data(jq[0], "etreegrid").options;
            return opts;
        },
        enableEditing: function (jq) {
            return jq.each(function () {
                var opts = $.data(this, "etreegrid").options;
                opts.editing = true;
            });
        },
        disableEditing: function (jq) {
            return jq.each(function () {
                var opts = $.data(this, "etreegrid").options;
                opts.editing = false;
            });
        },
        editRow: function (jq, row) {
            return jq.each(function () {
                var dg = $(this);
                var opts = $.data(this, "etreegrid").options;
                var rowId = row[opts.idField];
                var editId = opts.editId;
                if (editId != rowId) {
                    if (dg.treegrid("validateRow", editId)) {
                        if (editId === 0) {
                            if (opts.onBeforeSave.call(this, editId) == false) {
                                setTimeout(function () {
                                    dg.treegrid("select", editId);
                                }, 0);
                                return;
                            }
                        }
                        dg.treegrid("endEdit", editId);
                        dg.treegrid("beginEdit", rowId);
                        opts.editId = rowId;
                        var node = dg.treegrid("find", rowId);
                        opts.onEdit.call(this, node);
                    } else {
                        setTimeout(function () {
                            dg.treegrid("select", editId);
                        }, 0);
                    }
                }
            });
        },
        addRow: function (jq) {
            return jq.each(function () {
                var dg = $(this);
                var opts = $.data(this, "etreegrid").options;
                var editId = opts.editId;
                if (opts.editId === 0) {
                    if (!dg.treegrid("validateRow", editId)) {
                        dg.treegrid("select", editId);
                        return;
                    }
                    if (opts.onBeforeSave.call(this, opts.editId) == false) {
                        setTimeout(function () {
                            dg.treegrid('select', opts.editId);
                        }, 0);
                        return;
                    }
                    dg.treegrid('endEdit', opts.editId);
                } else {
                    var selected = dg.treegrid("getSelected");
                    var parentId = selected ? selected[opts.idField] : 0;
                    var newRecord = {};
                    newRecord[opts.idField] = 0;
                    newRecord[opts.parentIdField] = parentId;
                    console.log(newRecord)
                    dg.treegrid("append", { parent: parentId, data: [newRecord] });
                    if (parentId > 0) {
                        var children = dg.treegrid("getChildren");
                    }
                    opts.editId = 0;
                    dg.treegrid("beginEdit", opts.editId);
                    dg.treegrid("select", opts.editId);

                }
            });
        },
        saveRow: function (jq) {
            return jq.each(function () {
                var dg = $(this);
                var opts = $.data(this, 'etreegrid').options;
                if (opts.editId === 0) {
                    if (!dg.treegrid("validateRow", opts.editId)) {
                        dg.treegrid("select", opts.editId);
                        return;
                    }
                    if (opts.onBeforeSave.call(this, opts.editId) == false) {
                        setTimeout(function () {
                            dg.treegrid('select', opts.editId);
                        }, 0);
                        return;
                    }
                    $(this).treegrid('endEdit', opts.editId);
                }
            });
        },
        cancelRow: function (jq) {
            return jq.each(function () {
                var rowId = $(this).etreegrid('options').editId;
                $(this).treegrid('cancelEdit', rowId);
            });
        },
        removeRow: function (jq) {
            return jq.each(function () {
                var dg = $(this);
                var opts = $.data(this, 'etreegrid').options;
                var row = dg.treegrid('getSelected');
                if (!row) return;
                if (row.isNewRecord) {
                    dg.treegrid("remove", row[opts.idField]);
                    return;
                }
                $.messager.confirm("确认", "确认删除这条数据吗？", function (r) {
                    if (!r) return;
                    var idValue = row[opts.idField];
                    if (opts.deleteUrl) {
                        $.post(opts.deleteUrl, { id: idValue }).done(function (json) {
                            dg.treegrid("remove", idValue);
                            opts.onRemove.call(dg[0], json, row);
                        }).error(function (xhr) {
                            var json = eval('(' + xhr.responseText + ')');
                            $.messager.alert('错误', json.message || json, "warning");
                        });
                    } else {
                        dg.datagrid('cancelEdit', idValue);
                        dg.datagrid('deleteRow', idValue);
                        opts.onRemove.call(dg[0], row);
                    }
                });
            });
        }
    };

    $.fn.etreegrid.defaults = $.extend({}, $.fn.treegrid.defaults, {
        editing: true,
        editId: undefined,
        messager: {},

        url: null,
        saveUrl: null,
        updateUrl: null,
        deleteUrl: null,

        onAdd: function (row) { },
        onEdit: function (row) { },
        onBeforeSave: function (index) { },
        onSave: function (row) { },
        onRemove: function (row) { },
    });
})(jQuery);
