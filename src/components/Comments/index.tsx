import { useUtterances } from '../../hooks/useUtterances';

const commentNodeId = 'comments';

import styles from './styles.module.scss'

export function Comments() {
	useUtterances(commentNodeId);
	return <div className={styles.comments} id={commentNodeId} />;
};
