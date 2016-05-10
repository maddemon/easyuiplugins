    $.fn.setUpload = function (uploadUrl, callback, beforeUpload) {
        var url = uploadUrl;
        if (typeof (uploadUrl) == "function") {
            url = uploadUrl();
        }
        var file = $(this);
        var fileId = file.attr("id");
        if (!fileId) {
            fileId = Math.random();
            file.attr("id", "file-" + fileId);
        }
        var inputName = file.attr("name");
        if (!inputName) {
            file.attr("name", fileId);
            inputName = fileId;
        }
        if (url.indexOf("?") == -1) {
            url += "?";
        }
        url += "&inputName=" + inputName;
        var form = file.parents("form");
        var formAction = form.attr("action");
        var formTarget = form.attr("target");

        file.change(function () {
            if (beforeUpload && !beforeUpload()) {
                reset();
                return;
            }
            var targetId = "iframe_upload" + Math.random();
            var iframe = $('<iframe width="0" height="0" frameborder="0" id="' + targetId + '" name="' + targetId + '">');
            document.body.appendChild(iframe[0]);
            form.attr({
                target: targetId,
                action: url,
                enctype: "multipart/form-data",
                method: "POST"

            });
            form.submit();
            iframe.load(function () {
                var content = $(this).contents().find("body").html();
                try {
                    var json = eval("(" + content + ")");
                    callback(json);
                } catch (ex) {
                    alert("上传出错了" + ex.message);
                }
                reset();
                iframe.remove();
            });
        });

        function reset() {
            var fileId = file.attr("id");
            var newFile = file.clone();
            newFile.value = "";
            file.replaceWith(newFile);
            form.removeAttr("target");
            form.removeAttr("enctype");
            form.attr("action", formAction);
            if (formTarget) {
                form.attr("target", formTarget);
            }
            $("#" + fileId).setUpload(uploadUrl, callback, beforeUpload);
        }
    };
