ymaps.ready(init);

function init() {

    // Создание экземпляра карты.
    var myMap = new ymaps.Map('map', {
            center: [50.443705, 30.530946],
            zoom: 14,
            controls: ['fullscreenControl']
        }, {
            searchControlProvider: 'yandex#search'
        }),
        // Контейнер для меню.
        menu = $('<ul class="menu"/>'),
                // Коллекция для геообъектов группы.
            collection = new ymaps.GeoObjectCollection(null, {  });

        // Добавляем коллекцию на карту.
        myMap.geoObjects.add(collection);
        myMap.controls.add('zoomControl', {position: {right: '10px', top: '50px'}});

    for (var i = 0, l = groups.length; i < l; i++) {
        createMenuGroup(groups[i], i);
    }

    function createMenuGroup (group, order) {
        // Пункт меню.
        var active = (order==0) ? ' class="active"' : '';
        var menuItem = $('<li id="' + group.id + '"><a href="#"' + active + '>' + group.name + '</a></li>'),

        // Контейнер для подменю.
            submenu = $('<ul class="submenu"/>'),
            search = $('<div class="search" id="search_' + group.id + '" data-id="' + group.id + '"><input type="text" placeholder="Найти"></div>');
        

        if(group.id=="rf"){
            for (var i = 0, l = group.items.length; i < l; i++) {
                for (var i2 = 0, l2 = group.items[i].items.length; i2 < l2; i2++) {
                    var item = group.items[i].items[i2];
                    var placemark = new ymaps.Placemark(item.center, { balloonContent: item.name });
                    collection.add(placemark);
                }
            }
        }
        // Добавляем подменю.
        menuItem
            .append(search)
            .append(submenu)
            // Добавляем пункт в меню.
            .appendTo(menu)
            // По клику удаляем/добавляем коллекцию на карту и скрываем/отображаем подменю.
            .find('a')
            .bind('click', function () {
                var id = $(this).parent().attr('id');
                myMap.geoObjects.remove(collection);
                collection = new ymaps.GeoObjectCollection(null, { preset: group.style }),
                myMap.geoObjects.add(collection);

                if(group.id==id){
                    for (var i = 0, l = group.items.length; i < l; i++) {
                        for (var i2 = 0, l2 = group.items[i].items.length; i2 < l2; i2++) {
                            var item = group.items[i].items[i2];
                            var placemark = new ymaps.Placemark(item.center, { balloonContent: item.name });
                            collection.add(placemark);
                        }
                    }
                }

                $('.menu > li > a').removeClass('active');
                $(this).addClass('active');
                $('.menu').find('.submenu').hide();
                $('.menu').find('.search').hide();
                submenu.show();
                search.show();

                myMap.setBounds(myMap.geoObjects.getBounds());
                var position = myMap.getGlobalPixelCenter();
                myMap.setGlobalPixelCenter([ position[0] - 250, position[1] ]);
                myMap.setZoom(3);

            });


            for (var j = 0, m = group.items.length; j < m; j++) {
                createSubMenu(group.items[j], submenu);
                createSearch(group, search);
            }
            if(order==1) {
                submenu.hide();
                search.hide();
            }
    }

    function createSubMenu (item, submenu) {
        // Пункт подменю.
        var submenuItem = $('<li id="item_' + item.id + '" data-id="' + item.id + '"><a href="#">' + item.name + '</a></li>'),
        // Контейнер для подподменю.
            subsubmenu = $('<ul class="subsubmenu" id="ul_' + item.id + '" style="display:none" />');

        // Добавляем пункт в подменю.
        submenuItem
            .append(subsubmenu)
            .appendTo(submenu)

            // При клике по пункту подменю открываем/закрываем баллун у метки.
            .find('a')
            .bind('click', function () {
                    myMap.geoObjects.remove(collection);
                    var id = $(this).parent().data('id');
                    myMap.geoObjects.remove(collection);
                    collection = new ymaps.GeoObjectCollection(null, { preset: item.style }),
                    myMap.geoObjects.add(collection);

                    if(item.id==id){
                        for (var i = 0, l = item.items.length; i < l; i++) {
                            //for (var i2 = 0, l2 = group.items[i].items.length; i2 < l2; i2++) {
                                var item2 = item.items[i];
                                var placemark = new ymaps.Placemark(item2.center, { balloonContent: item2.name });
                                collection.add(placemark);
                            //}
                        }
                    }

                    myMap.setBounds(myMap.geoObjects.getBounds());
                    var position = myMap.getGlobalPixelCenter();
                    myMap.setGlobalPixelCenter([ position[0] - 250, position[1] ]);

                    subsubmenu.slideDown();
                //}
            });
            for (var j = 0, m = item.items.length; j < m; j++) {
                createSubSubMenu(item.items[j], subsubmenu, item.id);
                //for (var k = 0, n = group.items[j].items.length; k < n; k++) {
                //    createSubMenu(group.items[j].items[k], collection, subsubmenu);
                //}
            }
    }


    function createSubSubMenu (item, subsubmenu, parentID) {
        // Пункт подменю.
        var subsubmenuItem = $('<li id="item_' + item.id + '" data-parent="' + parentID + '"><a href="#">' + item.name + '</a></li>');
        // Добавляем пункт в подменю.
        subsubmenuItem
            .appendTo(subsubmenu)
            // При клике по пункту подменю открываем/закрываем баллун у метки.
            .find('a')
            .bind('click', function () {
                myMap.geoObjects.remove(collection);
                collection = new ymaps.GeoObjectCollection(null, { preset: item.style }),
                myMap.geoObjects.add(collection);
                var placemark = new ymaps.Placemark(item.center, { balloonContent: item.name });
                collection.add(placemark);
                myMap.panTo(item.center, {
                    // Задержка между перемещениями.
                    delay: 1500
                });
                return false;
            });

    }


    function createSearch(group, searchdiv) {
        var search = searchdiv.find('input[type="text"]'),
            id = searchdiv.data('id');
        search.keyup(function(){
            var searchField = search.val();
            var regex = new RegExp(searchField, "i");
            var searchmenu = $('.menu li#'+id);
            /*две нижние строчки отвечают за способ показа результатов поиска. Нужное раскоментировать, ненужное закомментировать*/
            searchmenu.find('ul').hide(); //при поиске выпадает найденный город, другие области не скрываются, а сворачиваются их города
            //searchmenu.children('ul').children('li').hide(); //при поиске прячутся области, и показываетя область найденного города, как тут http://azgaz.ru/dealers/

            for (var j = 0, m = group.items.length; j < m; j++) {
                for (var k = 0, n = group.items[j].items.length; k < n; k++) {
                    
                    var data = group.items[j].items[k];
                    $.each(data, function(key, val){

                        if ((data.name.search(regex) != -1)) {
                            
                            //console.log(data.name);

                            var li = searchmenu.find('li#item_'+data.id);

                            /*две нижние строчки отвечают за способ показа результатов поиска. Нужное раскоментировать, ненужное закомментировать*/
                            li.parents('ul').show(); //при поиске выпадает найденный город, другие области не скрываются, а сворачиваются их города
                            //li.parents('.submenu > li').show(); //при поиске прячутся области, и показываетя область найденного города, как тут http://azgaz.ru/dealers/
                        }

                    });



                }
            }


            if (searchField.length==0) {
                searchmenu.find('ul.submenu').show();
                searchmenu.find('ul.subsubmenu').hide();
            }
        });
    }


    // Добавляем меню в тэг BODY.
    menu.appendTo($('#menu'));
    // Выставляем масштаб карты чтобы были видны все группы.
   //myMap.setGlobalPixelCenter(500);
   



    myMap.setBounds(myMap.geoObjects.getBounds());
    var position = myMap.getGlobalPixelCenter();
    myMap.setGlobalPixelCenter([ position[0] - 250, position[1] ]);
    myMap.setZoom(3);

}

