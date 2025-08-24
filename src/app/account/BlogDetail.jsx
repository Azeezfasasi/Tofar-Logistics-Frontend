import { Helmet } from 'react-helmet'
import BlogDetailMain from '../../assets/component/DashboardComponents.jsx/BlogDetailMain';
import HeaderSection from '@/assets/component/HomeComponents.jsx/HeaderSection';
import FooterSection from '@/assets/component/HomeComponents.jsx/FooterSection';

function BlogDetail() {
  return (
    <>
    <Helmet>
        <title>Blog Details - Tofar Logistics Agency</title>
    </Helmet>
    <HeaderSection />
    <BlogDetailMain />
    <FooterSection />
    </>
  )
}

export default BlogDetail;