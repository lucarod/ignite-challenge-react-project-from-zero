import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
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

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const formattedDate = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  )

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
              {formattedDate}
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

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {});

  if (!response) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
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
      post
    },
    revalidate: 60 * 30 // 30 minutes
  }
};
