# MAYAKOVSKY

**MAYAKOVSKY** является набором сервисов, пощряющих активность пользователей, использующих официальный сайт [golos.io](https://golos.io) и официальный набор приложений.

_[Архитектура приложения в формате PDF](https://github.com/GolosChain/mayakovsky/blob/master/Arch.pdf)_

Описание возможных `ENV`:

-   `GLS_LOGIN` _(обязательно)_ - логин аккаунта, через который осуществляем действия.

-   `GLS_WIF` _(обязательно)_ - ключ авторизации аккаунта.

-   `GLS_MIN_GOLOS_POWER` - минимальное значение силы голоса для того чтобы пройти валидацию фильтров.  
    При значении равном 0 - отключает фильтр.  
    Дефолтное значение - `0`.

-   `GLS_PROHIBITED_TAGS` - запрещенные для лайканья теги. Для отключения фильтра нужно указать значение `false`.  
    Дефолтное значение - `goldvoice`

-   `GLS_MIN_POST_LENGTH` - минимальное значение длины поста в символах для того чтобы пройти валидацию фильтров.  
    При значении равном 0 - отключает фильтр.  
    Дефолтное значение - `0`.

-   `GLS_PLANNER_MODE` - режим работы планнера -- `auto` либо `manual`.
    Дефолтное значение - `auto`.

-   `GLS_APP_NAME` - имя приложения, которое будет лайкаться. Для отключения фильтра нужно указать значение `false`.  
    Дефолтное значение - `golos.io/0.1`

-   `DAY_START` - время начала нового дня в часах относительно UTC, используется для таких вещей как валидация "1 пост в сутки".  
    Дефолтное значение - `3` (день начинается в 00:00 по Москве).

-   `GLS_MONGO_CONNECT` - строка подключения к базе MongoDB.
    Дефолтное значение - `mongodb://0.0.0.0/admin`

-   `BLOCKCHAIN_SUBSCRIBE_TIMEOUT` - таймаут подписки на новые блоки, срабатывает если за это время от блокчейн-ноды не пришло ни единого блока.
    Дефолтное значение - `60000`, что равно одной минуте.

-   `BLOCKCHAIN_NODE_ADDRESS` - адрес блокчейн-ноды для прослушивания.
    Дефолтное значение - `wss://ws.golos.io`

-   `METRICS_HOST` - адрес хоста для метрик StatsD.
    Дефолтное значение - `localhost`

-   `METRICS_PORT` - адрес порта для метрик StatsD.
    Дефолтное значение - `8125`

Установка и запуск:

-   `docker compose up`

Требует обязательного наличия переменных окружения LOGIN и WIF.
