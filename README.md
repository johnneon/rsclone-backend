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
## Работа с досками
Далее для работы с досками/колонками/карточками необходимо отправлять токен в заголовках запроса, опишу в полях запроса ниже.

Так же если токен умер прилетает ошибка:
```json
{
    "message": "You are not authorized!"
}
```

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