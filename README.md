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

## Работа с досками
Далее для работы с досками/колонками/карточками необходимо отправлять токен в заголовках запроса, опишу в полях запроса ниже.

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
