import { Header } from '../models/layout.model';

export const Headers: Header[] = [
  {
    title: 'Home',
    route: '/',
    active: 'home',
    icon: 'home',
  },
  {
    title: 'Lab',
    route: '/lab',
    active: 'lab',
    icon: 'science',
  },
  {
    title: 'Upload Image',
    route: '/upload-image',
    active: 'upload-image',
    icon: 'cloud_upload',
  },
  // {
  //   title: 'About',
  //   route: '/about',
  //   active: 'about',
  //   icon: 'info',
  // },
];
