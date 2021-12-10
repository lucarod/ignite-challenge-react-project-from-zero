import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link'
import Prismic from '@prismicio/client';

import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar, FiUser } from 'react-icons/fi'

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const formattedPost = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    }
  })

  const [posts, setPosts] = useState<Post[]>(formattedPost);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [currentPage, setCurrentPage] = useState(1)

  async function handleNextPage(): Promise<void> {
    if (currentPage !== 1 && nextPage === null) {
      return;
    }

    const response = await fetch(`${nextPage}`);
    const postsResponse = await response.json();

    setNextPage(postsResponse.next_page);
    setCurrentPage(postsResponse.page);
    renderNewPosts(postsResponse.results);
  }

  function renderNewPosts(postsData) {
    const newPosts = postsData.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author
        }
      }
    })

    setPosts([...posts, ...newPosts])
  }

  return (
    <>
      <Head>
        <title>Posts | spacetravelling</title>
      </Head>

      <main className={commonStyles.container700}>
        <header className={styles.headerContainer}>
          <img src="/logo.svg" alt="logo" />
        </header>
        <div className={styles.content}>
          { posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={styles.info}>
                  <time>
                    <FiCalendar size={20} />
                    {post.first_publication_date}
                  </time>
                  <span>
                    <FiUser size={20} />
                    {post.data.author}
                  </span>
                </div>
              </a>
            </Link>
          )) }
        </div>
        {!!nextPage &&
          <button
            className={styles.loadButton}
            onClick={handleNextPage}
          >
            Carregar mais posts
          </button>
        }
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    pageSize: 1,
     }
  );

  const posts = postsResponse.results?.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  }

  return {
    props: {
      postsPagination
    }
  }
};
