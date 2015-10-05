angular.module('gettext').run(['gettextCatalog', function (gettextCatalog) {
/* jshint -W100 */
    gettextCatalog.setStrings('en', {"Валюта":"Currency","Назад":"Back","Нет счетов":"No accounts","Отменить":"Cancel","Сохранить":"Save"});
/* jshint +W100 */
}]);