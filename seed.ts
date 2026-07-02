// seed.ts
import 'dotenv/config';
import { prisma } from './lib/prisma';

async function seed() {
    // 1. Пользователи
    const users = await Promise.all([
        prisma.user.create({
            data: {
                username: 'max',
                email: 'max@mail.com',
                password: 'hash',
                birthday: new Date('2001-06-15'),
                about: 'Full-stack developer. Люблю React, Node.js и чёрный кофе. В свободное время играю в шахматы.',
                profilePicture: 'https://i.pravatar.cc/300?img=1',
            }
        }),
        prisma.user.create({
            data: {
                username: 'lena',
                email: 'lena@mail.com',
                password: 'hash',
                birthday: new Date('2003-03-22'),
                about: 'UX/UI дизайнер. Рисую интерфейсы, коллекционирую винил и обожаю котов.',
                profilePicture: 'https://i.pravatar.cc/300?img=5',
            }
        }),
        prisma.user.create({
            data: {
                username: 'dima',
                email: 'dima@mail.com',
                password: 'hash',
                birthday: new Date('1999-11-08'),
                about: 'DevOps инженер. Автоматизирую всё что движется. Люблю горные лыжи и крафтовое пиво.',
                profilePicture: 'https://i.pravatar.cc/300?img=3',
            }
        }),
    ]);

    const [max, lena, dima] = users;

    // 2. Сообщества
    const communities = await Promise.all([
        prisma.community.create({
            data: {
                name: 'tech',
                description: 'Обсуждаем технологии, программирование, AI и всё что связано с IT. Делимся опытом, помогаем новичкам.',
                imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
            }
        }),
        prisma.community.create({
            data: {
                name: 'memes',
                description: 'Самые свежие мемы про разработку, жизнь и всё остальное. Смеяться разрешается громко.',
                imageUrl: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400',
            }
        }),
        prisma.community.create({
            data: {
                name: 'games',
                description: 'Игровое сообщество. Обсуждаем новинки, делимся скриншотами, ищем тиммейтов для рейдов.',
                imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400',
            }
        }),
    ]);

    const [tech, memes, games] = communities;

    // 3. Подписки
    for (const user of users) {
        for (const comm of communities) {
            await prisma.communityMember.create({ data: { userId: user.id, communityId: comm.id } });
        }
    }

    // 4. Посты
    const postData = [
        { comm: tech, author: max, title: 'Почему TypeScript побеждает JavaScript в 2026', desc: 'Разбираем плюсы строгой типизации на реальных примерах.', likes: 156, img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600' },
        { comm: tech, author: lena, title: 'Мой переход с REST на GraphQL', desc: 'Спустя полгода использования GraphQL делюсь впечатлениями.', likes: 89, img: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600' },
        { comm: tech, author: dima, title: 'Docker для начинающих: пошаговый гайд', desc: 'Разворачиваем Node.js приложение в Docker с нуля.', likes: 203, img: null },
        { comm: tech, author: max, title: 'Нейросети в продакшене: мои грабли', desc: 'Запустил AI-сервис и получил кучу проблем.', likes: 178, img: null },
        { comm: tech, author: lena, title: 'Prisma vs TypeORM: мой выбор', desc: 'Сравниваю две ORM для Node.js.', likes: 67, img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600' },
        { comm: memes, author: dima, title: 'Когда прод в пятницу вечером', desc: 'Деплою в 17:55 и ухожу. Что может пойти не так?', likes: 420, img: 'https://images.unsplash.com/photo-1538024335102-c0d6b23a4e3a?w=600' },
        { comm: memes, author: max, title: 'Менеджер спросил "как дела с задачами"', desc: 'Та самая улыбка когда у тебя 50 незакрытых тасок.', likes: 312, img: null },
        { comm: memes, author: lena, title: 'Бэкендеры vs Фронтендеры', desc: 'Вечная война фронта и бэка. Никакой токсичности.', likes: 289, img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600' },
        { comm: memes, author: dima, title: 'Компилится — значит работает', desc: 'Легендарный девиз разработчика.', likes: 534, img: null },
        { comm: memes, author: max, title: 'Удалил node_modules — освободил 50 ГБ', desc: 'Чувство когда на SSD снова есть место.', likes: 198, img: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=600' },
        { comm: games, author: lena, title: 'Elden Ring: наконец-то прошёл!', desc: '250 часов, 3 геймпада и куча нервов.', likes: 145, img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600' },
        { comm: games, author: dima, title: 'Ищу тиммейтов для CS2', desc: 'Ранг MG2, играю по вечерам. Токсиков прошу мимо.', likes: 78, img: null },
        { comm: games, author: max, title: 'Топ-5 инди-игр 2026 года', desc: 'Собрал подборку лучших инди-проектов.', likes: 267, img: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2cf2?w=600' },
        { comm: games, author: lena, title: 'Собрал новый ПК', desc: 'RTX 5080, Ryzen 9, 64 ГБ RAM.', likes: 156, img: 'https://images.unsplash.com/photo-1591485423007-765bde4139ef?w=600' },
        { comm: games, author: dima, title: 'Одиночные игры vs Мультиплеер', desc: 'Рассуждаю о сюжете, атмосфере.', likes: 92, img: null },
    ];

    const allPosts: any[] = [];
    const commentTexts = [
        'Отличный пост! Очень познавательно, спасибо.',
        'Согласен на 100%. Тоже через это проходил.',
        'А можно поподробнее про это?',
        'Хахаха, в точку!',
        'Круто! Как раз искал такую информацию.',
        'Лайк, добавил в закладки.',
        'Интересная точка зрения.',
        'Подскажи а как это настроить?',
    ];

    for (let i = 0; i < postData.length; i++) {
        const p = postData[i];
        const post = await prisma.post.create({
            data: {
                title: p.title,
                description: p.desc,
                image: p.img,
                authorId: p.author.id,
                communityId: p.comm.id,
                likesCount: p.likes,
            }
        });
        allPosts.push(post);

        const createdComments: any[] = [];
        const numComments = 2 + (i % 2);

        for (let j = 0; j < numComments; j++) {
            const comment = await prisma.comment.create({
                data: {
                    content: commentTexts[(i + j) % commentTexts.length],
                    authorId: users[(i + j) % 3].id,
                    postId: post.id,
                }
            });
            createdComments.push(comment);
        }

        if (createdComments.length >= 2) {
            await prisma.comment.create({
                data: {
                    content: 'Полностью поддерживаю!',
                    authorId: users[(i + 1) % 3].id,
                    postId: post.id,
                    parentCommentId: createdComments[0].id,
                }
            });

            await prisma.comment.create({
                data: {
                    content: 'Есть над чем подумать, спасибо!',
                    authorId: users[(i + 2) % 3].id,
                    postId: post.id,
                    parentCommentId: createdComments[1].id,
                }
            });
        }
    }

    // Реплаи на посты
    await prisma.post.create({
        data: {
            title: 'Re: ' + allPosts[0].title,
            description: 'Отличный пост! Тоже заметил что TypeScript реально спасает от глупых ошибок.',
            authorId: lena.id,
            communityId: tech.id,
            parentPostId: allPosts[0].id,
            likesCount: 45,
        }
    });

    await prisma.post.create({
        data: {
            title: 'Re: ' + allPosts[5].title,
            description: 'Пятничные деплои это отдельный вид экстрима!',
            authorId: max.id,
            communityId: memes.id,
            parentPostId: allPosts[5].id,
            likesCount: 89,
        }
    });

    await prisma.post.create({
        data: {
            title: 'Re: ' + allPosts[10].title,
            description: 'Elden Ring — легенда! Жду DLC.',
            authorId: dima.id,
            communityId: games.id,
            parentPostId: allPosts[10].id,
            likesCount: 33,
        }
    });

    console.log('✅ Seed done!');
}

seed()
    .catch(console.error)
    .finally(() => prisma.$disconnect());