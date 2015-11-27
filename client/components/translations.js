'use strict';

(function () {
  angular.module('gettext').run(['gettextCatalog', function (gettextCatalog) {
    /* jshint -W100 */
    gettextCatalog.setStrings('ru', {
      "| Invites |": "| Приглашения |",
      "| Operations": "| Операции",
      "Accounts |": "Учётные записи |",
      "Add new agent": "Добавить нового агента",
      "Agent name": "Имя агента",
      "Agent's completed operations": "Завершенные операции",
      "Agents": "Агенты пользователя",
      "Back": "Назад",
      "Borrow": "Взять в долг",
      "Cancel": "Отмена",
      "Confirm": "Подтвердить",
      "Confirmed": "Подтвержден",
      "Contacts": "Контакты",
      "Create operation": "Создать операцию",
      "Currency": "Валюта",
      "English": "Английский",
      "Lend": "Одолжить",
      "Logout": "Выйти",
      "Name": "Имя",
      "New operation": "Новая операция",
      "No agents": "Без агентов",
      "Operations": "Операции",
      "Russian": "Русский",
      "Save": "Сохранить",
      "User's agents": "Агенты пользователя",
      "Waiting for confirmation": "Ждет подтверждения",
      "Welcome, it is your debts management app": "Добро пожаловать, это программка управления долгами",
      "You do not have contacts": "У вас нет контактов"
    });
    /* jshint +W100 */
  }]);
})();
