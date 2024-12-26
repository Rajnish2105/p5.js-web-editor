import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Nav from '../../IDE/components/Header/Nav';
import RootPage from '../../../components/RootPage';
import Collection from '../components/Collection';
import { useWhatPage } from '../../IDE/hooks';

const CollectionView = () => {
  const params = useParams();
  const { t } = useTranslation();
  const pageName = useWhatPage();
  const pagetitle = String(t(pageName));

  console.log('the pagename: ', pageName);
  console.log('the pagename: ', t(pageName));

  return (
    <RootPage>
      <Nav layout="dashboard" mobileTitle={pagetitle} />
      <Collection
        collectionId={params.collection_id}
        username={params.username}
      />
    </RootPage>
  );
};

export default CollectionView;
