import { GetStaticProps } from 'next';
import Link from 'next/link'

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

export default function Home() {
  return (
    <main className={commonStyles.container700}>
      <header className={styles.headerContainer}>
        <img src="/logo.svg" alt="logo" />
      </header>
      <div className={styles.content}>
        <Link href="/post/fhuifshd">
          <a>
            <strong>Como utilizar Hooks</strong>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>
            <div className={styles.info}>
              <time>
                <FiCalendar size={20} />
                15 Mar 2021
              </time>
              <span>
                <FiUser size={20} />
                Joseph Oliveira
              </span>
            </div>
          </a>
        </Link>
        <Link href="/post/fhuifshd">
          <a>
            <strong>Como utilizar Hooks</strong>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>
            <div className={styles.info}>
              <time>
                <FiCalendar size={20} />
                15 Mar 2021
              </time>
              <span>
                <FiUser size={20} />
                Joseph Oliveira
              </span>
            </div>
          </a>
        </Link>
        <Link href="/post/fhuifshd">
          <a>
            <strong>Como utilizar Hooks</strong>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>
            <div className={styles.info}>
              <time>
                <FiCalendar size={20} />
                15 Mar 2021
              </time>
              <span>
                <FiUser size={20} />
                Joseph Oliveira
              </span>
            </div>
          </a>
        </Link>
      </div>
      <button className={styles.loadButton}>Carregar mais posts</button>
    </main>
  )
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
