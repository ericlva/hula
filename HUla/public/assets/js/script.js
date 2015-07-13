
(function () {
    /*
    * Utility
    */
    var Util = {};

    /*
    * UI
    */
    var UI = (function () {
        var $loading = $('#js-mask');
        var $toast = $('#js-toast');
        var loadingTimer = 0;

        return {
            showLoading: function() {
                loadingTimer = setTimeout(function () {
                    $loading.show();
                }, 100);
            },
            hideLoading: function () {
                clearTimeout(loadingTimer);
                $loading.hide();
            },
            showError: function (text) {
                $toast.addClass('alert-danger').text(text).show();
                setTimeout(function () {
                    $toast.removeClass('alert-danger').text('').hide();
                }, 2000);
            }
        };
    })();

    /*
    * Ajax
    */
    var Ajax = (function () {
        var successHandler = function (data) {
            data = data || {};
            return data;
        };

        var errorHandler = function (error) {
            error = error || {};

            return {
                ack: 0,
                msg: error.status + ': ' + error.statusText
            }
        }

        var get = function (url, successFn, errorFn) {
            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                contentType: "application/json; charset=utf-8"
            }).done(function (data) {
                    data = successHandler(data);
                    if (data.ack) {
                        errorFn && errorFn(data);
                    } else {
                        successFn && successFn(data);
                    }
                })
                .fail(function (error) {
                    error = errorHandler(error);
                    errorFn && errorFn(error);
                });
        }

        var put = function (url, data, successFn, errorFn) {
            $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data),
                dataType: 'json',
                contentType: "application/json; charset=utf-8"
            }).done(function (data) {
                    data = successHandler(data);
                    if (data.ack) {
                        errorFn && errorFn(data);
                    } else {
                        successFn && successFn(data);
                    }
                })
                .fail(function (error) {
                    error = errorHandler(error);
                    errorFn && errorFn(error);
                });
        }

        var post = function (url, data, successFn, errorFn) {
            $.ajax({
                url: url,
                type: 'POST',
                data: JSON.stringify(data),
                dataType: 'json',
                contentType: "application/json; charset=utf-8"
            }).done(function (data) {
                    data = successHandler(data);
                    if (data.ack) {
                        errorFn && errorFn(data);
                    } else {
                        successFn && successFn(data);
                    }
                })
                .fail(function (error) {
                    error = errorHandler(error);
                    errorFn && errorFn(error);
                });
        }

        return {
            get: get,
            put: put,
            post: post
        };
    })();

    /*
    * Service Page
    */
    var serviceAction = function () {
        var $servicePage = $('.service-page');
        var $serviceTable = $servicePage.find('.js-service-table');
        var $emptyElm = $serviceTable.find('.js-empty')

        $servicePage.on('click', '.js-add-service', function (e) {
            e.preventDefault();

            if (!$serviceTable.find('>tbody>tr').not($emptyElm).length) {
                $emptyElm.hide();
            }

            var $tplItem = $servicePage.find('.js-service-tpl-item');
            $serviceTable.append($($tplItem.html()));
        });

        // 编辑
        $serviceTable.on('click', '.js-edit', function (e) {
            e.preventDefault();
            var $target = $(this);
            var $root = $target.closest('tr');

            $target.hide();
            $root.find('input').removeAttr('disabled');
            $root.find('.js-save, .js-cancel').show();
            $root.find('.js-delete, .js-contract').hide();
        });

        // 确认
        $serviceTable.on('click', '.js-save', function (e) {
            e.preventDefault();
            var $target = $(this);
            var $root = $target.closest('tr');
            var id = $root.attr('data-id');
            var ajaxStr = id ? 'put' : 'post';
            var NO = $.trim($root.find('.js-input-no').val());

            UI.showLoading();
            Ajax[ajaxStr]('/restapi/service/' + id, {
                name: $.trim($root.find('.js-input-name').val()),
                url: $.trim($root.find('.js-input-url').val()),
                NO: NO
            }, function (data) {
                UI.hideLoading();
                $target.hide();
                $root.find('input').each(function () {
                    $(this).attr('data-value', $(this).val()).attr('disabled', 'disabled')
                });

                if (data._id) {
                    var id = data._id.toString();
                    $root.attr('data-id', id);
                    $root.find('.js-contract').attr('href', '/contract/?srv_id=' + id + '&no=' + NO);
                    $root.find('.js-delete').attr('href', '/service/delete/' + id);
                }

                $root.find('.js-cancel').hide();
                $root.find('.js-edit, .js-delete, .js-contract').show();
            }, function (error) {
                UI.hideLoading();
                error.msg && UI.showError(error.msg);
            })
        });

        // 取消
        $serviceTable.on('click', '.js-cancel', function (e) {
            e.preventDefault();
            var $target = $(this);
            var $root = $target.closest('tr');
            var id = $root.attr('data-id');

            if ($serviceTable.find('>tbody>tr').not($emptyElm).length < 2) {
                $emptyElm.show();
            }

            if (!id) {
                $root.remove();
                return;
            }

            $target.hide();
            $root.find('input').each(function () {
                $(this).val($(this).attr('data-value')).attr('disabled', 'disabled')
            });
            $root.find('.js-save').hide();
            $root.find('.js-edit, .js-delete, .js-contract').show();
        });
    };

    /*
    * Contract Page
    */
    var contractAction = function () {
        var $contractPage = $('.contract-page');
        var tplSingle = $('#tpl_single').html();
        var tplExtend = $('#tpl_extend').html();

        $contractPage.on('change', 'select', function () {
            var $target = $(this);
            var $parent = $target.closest('.input-wrap');
            var val = $.trim($target.val());

            switch (val) {
                case 'Object':
                case 'List':
                    $parent.next().remove().end().after(tplExtend);
                    break;
                default:
                    $parent.next().remove();
            }
        });

        $contractPage.on('click', '.js-add', function () {
            $(this).closest('li').after(tplSingle);
        });

        $contractPage.on('click', '.js-delete', function () {
            $(this).closest('li').remove();
        });

        var loopList = function ($els) {
            var list = [];
            $els.each(function(){
                var $el = $(this);
                var $inputWrap = $el.find('.input-wrap');
                var subListValue = null;

                var $subList = $el.find('>ul>li');
                if ($subList.length) {
                    subListValue = loopList($subList);
                }

                var key = $.trim($inputWrap.find('.js-key').val());
                var remark = $.trim($inputWrap.find('.js-remark').val());
                var metadata = $.trim($inputWrap.find('.js-metadata').val());

                if (!key) {
                    return;
                }

                list.push({
                    key: key,
                    remark: remark,
                    metadata: metadata,
                    value: subListValue
                });
            });
            return list;
        };
        // TODO 验证input
        $contractPage.on('click', '.js-save-contract', function (e) {
            e.preventDefault();
            var reqData = loopList($('.common-list.js-req>li'));
            var resData = loopList($('.common-list.js-res>li'));
            var id = $contractPage.attr('data-id');
            var srv_id = $contractPage.attr('data-srv-id');
            var NO = $contractPage.attr('data-no');
            var ajaxStr = id ? 'put' : 'post';

            UI.showLoading();
            Ajax[ajaxStr]('/restapi/contract/' + (id || ''), {
                srv_id: srv_id,
                NO: NO,
                req: reqData,
                res: resData
            }, function (data) {
                UI.hideLoading();
                window.location.href = '/contract/?srv_id=' + srv_id;
            }, function (error) {
                UI.hideLoading();
                error.msg && UI.showError(error.msg);
            })

        });
    }

    /*
    * Case Page
    */
    var caseAction = function () {
        var $casePage = $('.case-page');

        $casePage.on('click', '.js-add', function (e) {
            var $curSubTree = $(this).closest('.input-wrap').next('.list-tree').first();
            var $appendTree = $curSubTree.clone();
            $appendTree.find('.js-input').val('');
            $curSubTree.after($appendTree);
        });

        $casePage.on('click', '.js-delete', function (e) {
            var $curSubTree = $(this).closest('.list-tree');
            $curSubTree.remove();
        });

        var loopList = function ($els) {
            var list = [];
            $els.each(function(){
                var $el = $(this);
                var $inputWrap = $el.find('.input-wrap');
                var subListValue = null;

                var key = $.trim($inputWrap.attr('data-key'));
                var remark = $.trim($inputWrap.attr('data-remark'));
                var metadata = $.trim($inputWrap.attr('data-metadata'));
                var val = null;

                // Metadata: Number, String, Object, List, Array, Boolean
                switch (metadata) {
                    case 'String':
                        val = $.trim($inputWrap.find('.js-input').val()) || null;
                        break;
                    case 'Number':
                        val = parseInt($.trim($inputWrap.find('.js-input').val()), 10) || null;
                        break;
                    case 'Boolean':
                        val = $.trim($inputWrap.find('.js-boolean').val()) == 1;
                        break;
                    case 'Array':
                        val = $.trim($inputWrap.find('.js-input').val()).split(',') || null;
                        break;
                    case 'Object':
                        var $subList = $el.find('>ul>li');
                        if ($subList.length) {
                            subListValue = loopList($subList);
                        }
                        break;
                    case 'List':
                        var $subLists = $el.find('>.list-tree');
                        subListValue = [];
                        if ($subLists.length) {
                            $subLists.each(function () {
                                subListValue.push(loopList($(this).find('>li')));
                            });
                        }
                        break;
                    default:
                        break;
                }

                list.push({
                    key: key,
                    remark: remark,
                    metadata: metadata,
                    value: subListValue,
                    val: val
                });
            });
            return list;
        };
        // TODO 验证input
        $casePage.on('click', '.js-save-case', function (e) {
            e.preventDefault();
            var reqData = loopList($('.common-list.js-req>li'));
            var resData = loopList($('.common-list.js-res>li'));
            var name = $.trim($casePage.find('.js-name').val());
            var id = $casePage.attr('data-id');
            var srv_id = $casePage.attr('data-srv-id');
            var con_id = $casePage.attr('data-con-id');
            var NO = $casePage.attr('data-no');
            var ajaxStr = id ? 'put' : 'post';

            UI.showLoading();
            Ajax[ajaxStr]('/restapi/case/' + (id || ''), {
                con_id: con_id,
                name: name,
                req: reqData,
                res: resData
            }, function (data) {
                UI.hideLoading();
                window.location.href = $('.js-back-btn').attr('href');
            }, function (error) {
                UI.hideLoading();
                error.msg && UI.showError(error.msg);
            })
        });

        //copy form template by melvin.ren
        var loop = function (ary, parentIsList, parentNode) {
            if (!ary || !ary.length) {
                ary = [{}]
            }
            var str = [];
            parentNode = parentNode || {};
            for (var i = 0, len = ary.length, v, isFirst, isList, subNode; i < len; i++) {
                v = ary[i];
                isFirst = i === 0;
                isList = v.metadata === 'List';
                subNode = parentNode[v.key];
                str.push('<li>');
                        str.push('<div class="line"></div>');
                        str.push('<div class="input-wrap" data-metadata="' + (v.metadata || '') + '" data-key="' + (v.key || '') + '" data-remark="' + (v.remark || '') + '">');
                            str.push('<strong class="text">' + (v.key || '') + '</strong>');
                            str.push('<span class="text">' + (v.remark || '') + '</span>');
                            str.push('<span class="text">' + (v.metadata || '') + '</span>');
                            if (v.metadata === 'String'){
                                str.push('<input type="text" class="js-input form-control" placeholder="String" value="' + (subNode || '') + '">');
                            } else if (v.metadata === 'Number') {
                                str.push('<input type="number" class="js-input form-control" placeholder="Number" min="0" value="' + (subNode || '') + '">');
                            } else if (v.metadata === 'Boolean') {
                                str.push('<select class="js-boolean">');
                                    str.push('<option value="1" ' + ((subNode === 1) ? 'selected' : '') + '>True</option>');
                                    str.push('<option value="0" ' + ((subNode === 0) ? 'selected' : '') + '>False</option>');
                                str.push('</select>');
                            } else if (v.metadata === 'Array') {
                                str.push('<input type="text" class="js-input form-control" placeholder="Array" value="' + (subNode || []).join(',') + '">');
                            }
                            if (isList) {
                               str.push('<button class="js-add btn btn-xs btn-success">add</button>');
                            }
                            if (parentIsList && i === 0) {
                               str.push('<button class="js-delete btn-delete btn btn-xs btn-danger">delete</button>');
                            }
                        str.push('</div>');
                        if (v.metadata === 'Object' || isList) {
                            if (Array.isArray(subNode)) {
                                subNode.forEach(function(tmpNode){
                                    str.push('<ul class="' + (isList ? "list-tree" : "") + '">');
                                        str.push(loop(v.value, isList, tmpNode));
                                    str.push('</ul>');
                                });
                            } else {
                                str.push('<ul class="' + (isList ? "list-tree" : "") + '">');
                                    str.push(loop(v.value, isList, subNode));
                                str.push('</ul>');
                            }
                        }
                str.push('</li>')
            }
            return str.join('');
        }

        $casePage.on('blur', '#js_caseReqString', function(e){
          var target = $(e.currentTarget),
              val = target.val(),
              con_req = JSON.parse($casePage.find('#js_con_req').val()),
              requestBox = $casePage.find('.js-req');
          if(!$.trim(val)){
            return;
          }
          var requestObj ;
          try{
            requestObj = JSON.parse(val);
          }catch(e){
            UI.showError('输入request格式不正确！')
            console.log(e);
            return;
          }
          var reqhtml = loop(con_req, false, requestObj);
          requestBox.html(reqhtml);
        });

        $casePage.on('blur', '#js_caseResString', function(e){
          var target = $(e.currentTarget),
              val = target.val(),
              con_res = JSON.parse($casePage.find('#js_con_res').val()),
              responseBox = $casePage.find('.js-res');
          if(!$.trim(val)){
            return;
          }
          var responseObj ;
          try{
            responseObj = JSON.parse(val);
          }catch(e){
            UI.showError('输入response格式不正确！')
            console.log(e);
            return;
          }
          var reshtml = loop(con_res, false, responseObj);
          responseBox.html(reshtml);
        });
        // Run Case
        (function () {
            $caseResultPage = $('#case-result');
            if ($caseResultPage.length) {
                var cases = JSON.parse($caseResultPage.find('.js-cases').val() || '[]');
                var contract = JSON.parse($caseResultPage.find('.js-contract').val() || '{}');
                var service = JSON.parse($caseResultPage.find('.js-service').val() || '{}');

            }
        })();
    };

    $(document).on('ready', function () {
        serviceAction();
        contractAction();
        caseAction();
    });

})();
