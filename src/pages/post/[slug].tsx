import { GetStaticPaths, GetStaticProps } from 'next';
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

export default function Post() {
  return (
    <>
      <Header />

      <main>
        <img src="/placeholder.png" alt="Placeholder" className={styles.banner} />
        <article className={commonStyles.container720}>
          <h1 className={styles.title}>Criando um app CRA do zero</h1>
          <div className={styles.info}>
            <time>
              <FiCalendar size={20} />
              15 Mar 2021
            </time>
            <span>
              <FiUser size={20} />
              Joseph Oliveira
            </span>
            <span>
              <FiClock size={20} />
              4 min
            </span>
          </div>
          <div className={styles.content}>
            <p>
              Nulla auctor sit amet quam vitae commodo. Sed risus justo, vulputate quis neque eget, dictum sodales sem. In eget felis finibus, mattis magna a, efficitur ex. Curabitur vitae justo consequat sapien gravida auctor a non risus. Sed malesuada mauris nec orci congue, interdum efficitur urna dignissim. Vivamus cursus elit sem, vel facilisis nulla pretium consectetur. Nunc congue.
            </p> <br />
            <p>
              Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aliquam consectetur massa nec metus condimentum, sed tincidunt enim tincidunt. Vestibulum fringilla risus sit amet massa suscipit eleifend. Duis eget metus cursus, suscipit ante ac, iaculis est. Donec accumsan enim sit amet lorem placerat, eu dapibus ex porta. Etiam a est in leo pulvinar auctor. Praesent sed vestibulum elit, consectetur egestas libero.
            </p>
          </div>
        </article>
      </main>
    </>
  )
}

// export const getStaticPaths = async () => {
//   const prismic = getPrismicClient();
//   const posts = await prismic.query(TODO);

//   // TODO
// };

// export const getStaticProps = async context => {
//   const prismic = getPrismicClient();
//   const response = await prismic.getByUID(TODO);

//   // TODO
// };
