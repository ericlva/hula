var express = require('express');
var router = express.Router();
var serviceModel = require('../modules/service');
var contractModel = require('../modules/contract');
var contractFormat = require('../libs/contractFormat');

// TODO 后续契约主页面可以单独访问，并根据select新建契约

router.get('/contract/', function(req, res, next) {
    var findContract = function (service) {
        service = service || {};
        var reqObj = req.query.srv_id ? { srv_id: req.query.srv_id } : {};

        contractModel.find(reqObj, null, function (error, result) {
            res.render('contract', {
                title: '契约',
                service: service,
                contracts: result || {},
                nav: 'service',
                errorMsg: error && error.msg,
                showSubTitle: !!req.query.srv_id,
                srv_id: service._id,
                NO: service.NO
            });
        });
    }

    if (req.query.srv_id) {
        serviceModel.findById(req.query.srv_id, null, function (error, service) {
            if (error) {
                res.render('contract', {
                    title: '契约',
                    service: {},
                    contracts: result || {},
                    nav: 'service',
                    errorMsg: error && error.msg,
                });
            } else {
                //TODO 找不到服务
                findContract(service);
            }
        });
    } else {
        res.redirect('/services');
    }
});

router.get('/contract/new', function(req, res, next) {
    res.render('contract-editor', {
        title: '新增契约',
        contract: {},
        req: [],
        res: [],
        nav: 'service',
        id: '',
        srv_id: req.query.srv_id || '',
        NO: req.query.no || ''
    });
});

router.get('/contract/:_id', function(req, res, next) {
    contractModel.findById(req.params._id, null, function (error, result) {
        result = result || {};
        console.log(result.req);
        res.render('contract-editor', {
            title: '编辑契约',
            contract: result || {},
            req: contractFormat.dbToView(result.req),
            res: contractFormat.dbToView(result.res),
            nav: 'service',
            errorMsg: error && error.msg,
            id: result && result._id && result._id.toString(),
            srv_id: req.query.srv_id,
            NO: req.query.no
        });
    });
});

router.get('/contract/delete/:_id', function(req, res, next) {
    contractModel.findByIdAndRemove(req.params._id, null, function (error, result) {
        if (error) {
            res.render('error', { title: '错误', message: '错误', nav: 'service', error: error });
        } else {
            var backUrl = req.header('Referer') || '/contract';
            res.redirect('back');
        }
    });
});

module.exports = router;
