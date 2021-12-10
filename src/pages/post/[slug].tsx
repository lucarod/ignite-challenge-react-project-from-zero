import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';
import { Comments } from '../../components/Comments';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface NavPost {
  uid: string;
  data: {
    title: string;
  }
}

interface PostProps {
  post: Post;
  navigation: {
    prevPost: NavPost[];
    nextPost: NavPost[];
  };
  preview: boolean;
}

export default function Post({ post, navigation, preview }: PostProps) {
  const router = useRouter();

  if (router.isFallback) return (
    <>
      <Head>
        <title>Carregando...</title>
      </Head>

      <Header />

      <main>
        <p className={styles.loadingText}>Carregando...</p>
      </main>
    </>
  )

  const isPostEdited = post.first_publication_date !== post.last_publication_date

  const formattedDate = {
    first_publication_date: format(new Date(post.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    last_publication_date: format(new Date(post.last_publication_date),
      "dd MMM yyyy', às 'HH:mm",
      {
        locale: ptBR,
      }
    )
  }

  const totalReadingTime = post.data.content.map(contentSection => {
    const headingArrayWords = contentSection.heading.split(/[^(\w+)]/g).filter(e => e).length;
    const bodyArrayWords = RichText.asText(contentSection.body)
      .split(/[^(\w+)]/g).filter(e => e).length;
    const totalWords = headingArrayWords + bodyArrayWords

    const readingTime = Math.ceil(totalWords / 200)

    return readingTime;
  }).reduce((acc, current) => {
    return acc + current;
  }, 0)

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetravelling</title>
      </Head>

      <Header />

      <main>
        <img src={post.data.banner.url} className={styles.banner} />
        <article className={commonStyles.container720}>
          <h1 className={styles.title}>{post.data.title}</h1>
          <div className={styles.info}>
            <time>
              <FiCalendar size={20} />
              {formattedDate.first_publication_date}
            </time>
            <span>
              <FiUser size={20} />
              {post.data.author}
            </span>
            <span>
              <FiClock size={20} />
              {`${totalReadingTime} min`}
            </span>
          </div>
          {isPostEdited && (
            <div className={styles.edited}>
              * editado em {formattedDate.last_publication_date}
            </div>
          )}


          {post.data.content.map(content => (
            <div key={content.heading} className={styles.content}>
              <h2 className={styles.heading}>{content.heading}</h2>
              <div
                className={styles.content}
                dangerouslySetInnerHTML={{__html: RichText.asHtml(content.body)}}
              />
            </div>
          ))}
        </article>
        <section className={commonStyles.container720}>
          {!!navigation.prevPost.length || !!navigation.nextPost.length ? (
            <>
              <hr className={commonStyles.horizontalRow} />
              <section className={styles.navigation}>
                <div>
                  {!!navigation.prevPost.length && (
                    <>
                      <p>{navigation.prevPost[0].data.title}</p>
                      <Link href={`/post/${navigation.prevPost[0].uid}`}>
                        <a>Post anterior</a>
                      </Link>
                    </>
                  )}
                </div>
                <div>
                  {!!navigation.nextPost.length && (
                    <>
                      <p>{navigation.nextPost[0].data.title}</p>
                      <Link href={`/post/${navigation.nextPost[0].uid}`}>
                        <a>Próximo post</a>
                      </Link>
                    </>
                  )}
                </div>
              </section>
            </>
          ) : ''}


          <Comments />

          {preview && (
            <aside className={`${commonStyles.exitPreview} ${commonStyles.container720}`}>
              <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
              </Link>
            </aside>
          )}
        </section>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
  );

  const paths = posts.results.map(post => {
    return {
      params: { slug: post.uid }
    }
  });

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  if (!response) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  const prevPost = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]'
    }
  )

  const nextPost = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.last_publication_date desc]'
    }
  )

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        }
      })
    }
  }

  return {
    props: {
      post,
      navigation: {
        prevPost: prevPost?.results,
        nextPost: nextPost?.results,
      },
      preview
    },
    revalidate: 60 * 30 // 30 minutes
  }
};
