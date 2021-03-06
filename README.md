# RS Tasktracker API
Документация по использованию АПИ приложения - **RS Tasktracker**.

Все запросы направляются по адресу: `https://rsclone-back-end.herokuapp.com/`
Далее в документации запросы будут описывать в таком виде:  `/api/auth/register`. <br>
Это подразумевает что в итоге у вас должен получится адрес вроде: <br>
`https://rsclone-back-end.herokuapp.com/api/auth/register`

В данный момент, если вам пришел ответ с сервера в виде:
```json
{
    "message": "Got an error!"
}
```
Прошу сообщить, в каком именно моменте вы это получается, так как это сигнал о неотловленной ошибке!
## Регистрация/авторизация
### Регистрация

Опции запроса для регистрации:
```
url: /api/auth/register
method: POST
headers: { Content-Type: application/json }
body: { login, fullName, password }
```
Ответ с сервера при успешной регистрации:
```json
{
    "message": "User created!"
}
```

Возможные ошибки: <br>
```json
{
    "message": "This user has been registered!"
}
```
```json
{
    "message": "Minimum number of characters 6!"
}
```
```json
{
    "message": "Incorect data!"
}
```

### Авторизация
Опции запроса для авторизации:
```
url: /api/auth/register
method: POST
headers: { Content-Type: application/json }
body: { login, password }
```
Ответ при успешной аунтификации:
```json
{
    "email": "j@mail.ru",
    "fullName": "john",
    "boards": [
        {
            "_id": "6006c799da791d16982dfea5",
            "name": "Board - 2"
        },
        {
            "_id": "6006c79dda791d16982dfea6",
            "name": "Board - 3.1"
        }
    ],
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDA2YmYyZjFkOGY5MDEzYmVkN2FiMGIiLCJpYXQiOjE2MTEwNTk2MjEsImV4cCI6MTYxMTA2MzIyMX0.vXSfTMXo8XKuxz8c_YSWz9we7shZg42pRlcPkTMQEF4",
    "userId": "6006bf2f1d8f9013bed7ab0b"
}
```
Возможные ошибки:
```json
{
    "message": "Incorect password!"
}
```
```json
{
    "message": "User not found!"
}
```
```json
{
    "message": "Incorect data!" // Временно, возможна доработка
}
```

Так же были случаи когда имя почему то записывали массивом, по этому добавил такое:

```json
{
    "message": "Type of name must be string!"
}
```

### JWT Token

Далее для работы с досками/колонками/карточками необходимо отправлять токен в заголовках запроса, опишу в полях запроса ниже.
Так же будет присутствовать специальный 'Refresh Token', для обновления 'Access token'а, жизнь токена для получания данных 4 часа.
Жизнь рефреш токена 7 дней.

Если токен отсутствует в заголовках, то получаем такую ошибку:
```json
{
    "message": "You are not authorized!"
}
```

Если получили ошибку:
```json
{
    "message": "Session timed out,please login again!"
}
```
Это означает что рефреш токен уже мертв, и нужно авторизироваться повторно.
Итак, когда у нас уже умер Access token, нам нужно его обновить, для этого отправляем такой запрос:
```
url: /api/auth/refresh_token
method: POST
headers: { Content-Type: application/json } приходит при авторизации
body: { refreshToken }
```
Где поле `refreshToken` - и является вашим рефреш токеном, и если запрос проходит успешно, то мы получаем новый токен:
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDA2YmYyZjFkOGY5MDEzYmVkN2FiMGIiLCJpYXQiOjE2MTEzOTU2MjQsImV4cCI6MTYxMTQ4MjAyNH0.VxqiQz8f9F1HqE38tLhtjIOn7yGUidgoInYOixz7HAw"
}
```
При передачи неверного рефреш токена получим:
```json
{
    "message": "Invalid token,please login again!"
}
```
Если токен не был отправлен:
```json
{
    "message": "Access denied,token missing!"
}
```
И если рефреш токен тоже мертв:
```json
{
    "message": "Token expired!"
}
```
### Выход с аккаунта
При выходе с аккаунта нужно передовать такой запрос:
```
url: /api/auth/logout
method: DELTE
headers: { Content-Type: application/json } приходит при авторизации
body: { userId }
```
Это сделанно для того что бы деактивировать рефреш токен на сервере. При успешном выходе получаем ответ:
```json
{
    "message": "User logged out!"
}
```
## Работа с досками
### Создание доски
Опции запроса для авторизации:
```
url: /api/board/
method: POST
headers: { Content-Type: application/json, Authorization: Bearer TOKEN } // Вместо TOKEN, вставляем код с поля token которое приходит при авторизации
body: { name }
```
Ответ при успешном создании доски:
```json
{
    "users": [
        "6006bf2f1d8f9013bed7ab0b" // массив с id всех юзеров которые могут получить и использовать доску
    ],
    "columns": [],
    "_id": "60070ad3adc21d37e2d52e69", // id самой доски, для дальнейших манипуляций и получения
    "name": "Board - 4"
}
```
Возможные ошибки:
```json
{
    "message": "Can not find board!"
}
```
```json
{
    "message": "The name can not contain invalid characters!"
}
```

### Получение доски со всеми данными в ней
Вместо `/:id` подставляем id так `/api/board/60070ad3adc21d37e2d52e69` (пример).
```
url: /api/board/:id
method: GET
headers: { Content-Type: application/json, Authorization: Bearer TOKEN } // Вместо TOKEN, вставляем код с поля token которое приходит при авторизации
```
Ответ при успешном получении доски:

```json
{
    "users": [
        {
            "_id": "6006bf2f1d8f9013bed7ab0b",
            "email": "j@mail.ru",
            "fullName": "john"
        }
    ],
    "columns": [
        {
            "position": 0,
            "cards": [
                {
                    "position": 0,
                    "_id": "6007d49c0c3d1f49a7fe1cec",
                    "name": "Card - 1. Column - 0.Board - 2.",
                    "columnId": "6006d1ec6fd4c32099773add"
                }
            ],
            "_id": "6006d1ec6fd4c32099773add",
            "name": "Column - 2. Board - 2",
            "boardId": "6006c799da791d16982dfea5"
        }
    ],
    "_id": "6006c799da791d16982dfea5",
    "name": "Board - 2"
}
```
Возможные ошибки:
```json
{
    "message": "Can not find board!"
}
```

### Получение всех досок без доп. информации о юзерах и колонках
```
url: /api/board/
method: GET
headers: { Content-Type: application/json, Authorization: Bearer TOKEN } // Вместо TOKEN, вставляем код с поля token которое приходит при авторизации
```

Ответ при успешном запросе:
```json
[
    {
        "_id": "6006c799da791d16982dfea5",
        "name": "Board - 2"
    },
    {
        "_id": "6006c79dda791d16982dfea6",
        "name": "Board - 3.1"
    },
    {
        "_id": "60070ad3adc21d37e2d52e69",
        "name": "Board - 4"
    }
]
```
 
 ### Обновление имени доски
 ```
url: /api/board/
method: PUT
headers: { Content-Type: application/json, Authorization: Bearer TOKEN } // Вместо TOKEN, вставляем код с поля token которое приходит при авторизации
body: { name }
```
Ответ при успешной смене названия доски:
```json
{
    "_id": "6006c799da791d16982dfea5",
    "name": "Board - 2.1"
}
```

### Удаление доски
Оговорка, вы не удаляете доску сразу, а покидаете ее, и в том случае если в доске не останется не одного пользователя, то она автоматически удалится с базы данных.
 ```
url: /api/board/:id
method: DELETE
headers: { Content-Type: application/json, Authorization: Bearer TOKEN } // Вместо TOKEN, вставляем код с поля token которое приходит при авторизации
```
При успешном покидании доски ответ будет таким:
```json
{
    "message": "You have successfully left the board!"
}
```
Возможные ошибки:
```json
{
    "message": "Can not find board!"
}
```

## Работа с колонками
### Создание колонки
boardId это id доски в которой создается колонка, параметр обязателен! Опции запроса для авторизации:
```
url: /api/column/
method: POST
headers: { Content-Type: application/json, Authorization: Bearer TOKEN } // Вместо TOKEN, вставляем код с поля token которое приходит при авторизации
body: { name, boardId }
```
Ответ при успешном создании доски:
```json
{
    "cards": [],
    "_id": "6007e350d1e5955028369500",
    "name": "Column - 1. Board - 3",
    "boardId": "6006c79dda791d16982dfea6"
}
```
Возможные ошибки:
```json
{
    "message": "Can not find board!"
}
```
```json
{
    "message": "The name can not contain invalid characters!"
}
```

### Получение колонки со всеми данными в ней
Вместо `/:id` подставляем id так `/api/board/6007e350d1e5955028369500` (пример).
```
url: /api/column/:id
method: GET
headers: { Content-Type: application/json, Authorization: Bearer TOKEN } // Вместо TOKEN, вставляем код с поля token которое приходит при авторизации
```
Ответ при успешном получении доски:

```json
{
    "cards": [
        {
            "_id": "6007e3b6d1e5955028369501",
            "name": "Card - 1. Column - 0.Board - 3.",
            "columnId": "6007e350d1e5955028369500"
        }
    ],
    "_id": "6007e350d1e5955028369500",
    "name": "Column - 1. Board - 3",
    "boardId": "6006c79dda791d16982dfea6"
}
```
Возможные ошибки:
```json
{
    "message": "Can not find column!"
}
```

 ### Обновление колонки
При обновлении позиции калонку, меняется ее место в массиве колонок в доске.
 ```
url: /api/column/:id
method: PUT
headers: { Content-Type: application/json, Authorization: Bearer TOKEN } // Вместо TOKEN, вставляем код с поля token которое приходит при авторизации
body: { name, position }
```
Пи успешном обновлении ответ будет таким:
```json
{
    "cards": [
        "6007e3b6d1e5955028369501"
    ],
    "_id": "6007e350d1e5955028369500",
    "name": "Column - 1.1. Board - 2",
    "boardId": "6006c79dda791d16982dfea6"
}
```
Возможные ошибки:
```json
{
    "message": "Can not find column!"
}
```

### Удаление колонки

 ```
url: /api/column/:id
method: DELETE
headers: { Content-Type: application/json, Authorization: Bearer TOKEN } // Вместо TOKEN, вставляем код с поля token которое приходит при авторизации
```
При успешном покидании доски ответ будет таким:
```json
{
    "message": "Column has been deleted!"
}
```
Возможные ошибки:
```json
{
    "message": "Can not find column!"
}
```

## Работа с карточкам
### Создание карточки
columnId это id колонки в которой создается карточка, параметр обязателен! Опции запроса для авторизации:
```
url: /api/cards/
method: POST
headers: { Content-Type: application/json, Authorization: Bearer TOKEN } // Вместо TOKEN, вставляем код с поля token которое приходит при авторизации
body: { name, columnId }
```
Ответ при успешном создании карточки:
```json
{
    "_id": "6007e350d1e5955028369500",
    "name": "Card - 1. Column - 1",
    "columnId": "6006c79dda791d16982dfea6"
}
```
Возможные ошибки:
```json
{
    "message": "Can not find column!"
}
```
```json
{
    "message": "The name can not contain invalid characters!"
}
```

### Получение карточки со всеми данными в ней
Вместо `/:id` подставляем id так `/api/cards/6007e350d1e5955028369500` (пример).
```
url: /api/cards/:id
method: GET
headers: { Content-Type: application/json, Authorization: Bearer TOKEN } // Вместо TOKEN, вставляем код с поля token которое приходит при авторизации
```
Ответ при успешном получении доски:

```json
{
    "_id": "6007d49c0c3d1f49a7fe1cec",
    "name": "Card - 1. Column - 0.Board - 2.",
    "columnId": "6006d1ec6fd4c32099773add"
}
```
Возможные ошибки:
```json
{
    "message": "Can not find card!"
}
```

 ### Обновление карточки
Поля не обязательные, но должно присутствовать хотя бы одно. Для смены позиции карточки, обязательно должны присутствовать поля columnId и position!
 ```
url: /api/cards/:id
method: PUT
headers: { Content-Type: application/json, Authorization: Bearer TOKEN } // Вместо TOKEN, вставляем код с поля token которое приходит при авторизации
body: { name, position, content, columnId }
{
    "_id": "6007d49c0c3d1f49a7fe1cec",
    "name": "new name",
    "columnId": "6006d1ec6fd4c32099773add",
    "content": "new content"
}
```

### Удаление карточки

 ```
url: /api/cards/:id
method: DELETE
headers: { Content-Type: application/json, Authorization: Bearer TOKEN } // Вместо TOKEN, вставляем код с поля token которое приходит при авторизации
```
При успешном покидании доски ответ будет таким:
```json
{
    "message": "Card has been deleted!"
}
```
Возможные ошибки:
```json
{
    "message": "Can not find card!"
}
```