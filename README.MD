# BSUIR-Schedule

Модуль, который парсит расписание БГУИРа в JSON  с поддержкой кеширования либо в ОЗУ, либо в MongoDB. 

Срзау вопрос, нафига парсить HTML, когда у них есть API в XML? — Потому что хочется. Но если случится такое чудо, что кто-то найдёт этот модуль и пришлёт PR для парсинга XML, то будет круто.

# Установка
Установочка через `npm`:
```sh
$ npm install bsuir-schedule --save
```
Чтобы собрать документацию
```sh
$ npm run generate-docs
```
Тесты (которых пока не сильно много)
```sh
$ npm test
```
> Не используйте `bsuir-schedule@latest`, возможно структура будет меняться.

# Использование

```JavaScript
const BSUIR = new (require('bsuir-schedule').BSUIRSchedule)()

console.log()

// Список преподавателей
BSUIR.teachers()
.then(console.log)
 
// Список групп
BSUIR.groups()
.then(console.log)
 
// Расписание для преподавателя
BSUIR.schedule('https://www.bsuir.by/schedule/scheduleEmployee.xhtml?id=500689')
.then(console.log)
 
//Расписание для группы
BSUIR.schedule('https://www.bsuir.by/schedule/schedule.xhtml?id=303942')
.then(console.log)
```
О структуре возвращаемых данных можно почитать где-то ниже.

## О кешировании
Кеш будет сохранятся в `MongoDB` через `mongoose` только в том случае, когда `[1, 2].indexOf(mongoose.connection.readyState) > -1`. В остальных случаях, кеш будет записываться в ОЗУ. То есть надо где-то уже в своём коде выполнить подключение, `mongoose.connect('mongodb://localhost/BSUIRSchedule')`, или же просто сделать так:
```JavaScript
const BSUIR = new require('bsuir-schedule').BSUIRSchedule(
    cacheManagerConfig: {
        uri: 'mongodb://localhost/BSUIRSchedule',
        modelName: 'BSUIRScheduleCache' // по желанию, можно изменить имя коллекции
    }
})
```

## Параметры
> от всех недопониманий можно избавиться заглянув в исходники

Конструктор класса `BSUIRSchedule` принимает объект с настройками:
|Опция|Тип|Описание|
|---|---|---|
|requester | BaseRequester | Экземпляр класса для обработки запросов на сайт БГУИРа, наследуется от `BaseRequester`. По умолчанию используется `TinyRequest`, основанный на [`tiny_request`](https://github.com/Naltox/tiny_request)|
|cacheManager | BaseCacheManager | Экземпляр класса для управления кешом, наследуется от `BaseCacheManager`|
|cacheManagerConfig | Object | Объект с параметрами для кеш-менеджера по умолчанию|
|groupsCacheTime | Number | Время жизни кеша для списка групп в секундах|
|groupsRequestParams | Object | Параметры для `requester`|
|teachersCacheTime | Number | Время жизни кеша для списка| преподавателей в секундах|
|teachersRequestParams | Object | Параметры для `requeste|r`|
|scheduleCacheTime | Number | Время жизни кеша для страни|цы| расписания в секундах|
|scheduleRequestParams | Objec | Параметры для `requester`|

> `require('bsuir-schedule').BaseRequester` и `require('bsuir-schedule').BaseCacheManager`

## Структура данных

#### `.teachers()` и .`groups()`
```JSON
[{
    name: 'Андреева О. В.',
    url: 'https://www.bsuir.by/schedule/scheduleEmployee.xhtml?id=510621'
}]
```
#### `.schedule()`
Для преподавателя:
```JSON
{
    "photo": "ссылка на фото",
    "name": "ФИО",
    "session ← Список учебных дней на сессии": [{  
        "date": "29.06.2017",
        "lessons ← Список занятий в этот день": [{ 
            "red ← помечено ли красным в расписании": true/false, 
            "time": "13:50-15:00",
            "subject": {
                "name": "Имя предмета"
            },
            "type?": "ПЗ или ЛК, или Экзамен, или Консультация",
            "classroom": "номер кабинета",
            "subgroup": "номер подгруппы",
            "note": "примечание",
            "groups": [
                {
                    "name": "имя группы",
                    "url": "ссылка на группу"
                }
            ]
        }]
    }],
    "shedule ← регулярное расписание": [{
        "day": "Пятница",
        "lessons": [{
            "red ← помечено ли красным в расписании": true/false, 
            "time": "11:40-13:15",
            "groups": [{
                "name": "Имя группы",
                "url": "Ссылка на расписание"
            }],
            "subject": {
                "name": "Название предмета"
            },
            "type": "ПЗ или ЛК, или Экзамен, или Консультация",
            "classroom": "аудитория",
            "weeks": "1, 3 ← по каким неделям проходит"
        }
    }]
}
```
Ну и для обчных групп всё то же самое, только вместо ключа `session.groups` стоит ключ `session.teachers`, и, соответсвенно, `schedule.groups` → `schedule.teachers`:
```JSON
[{
    "name": "ФИО",
    "url": "ссылка на расписание",
    "photo": "ссылка на фотку"
}]
```
..и у ключа `schedule.subject` возможно есть описание предмета с указанием академических часов

# TODO
  - Написать тесты
  - Чтобы можно было брать устаревший кеш, на случай, если расписание наебдылвайцуда
  - Чота поменять

# Contributions

2 пробела, одинарные кавычки и никаких точек с запятой

# License

MIT