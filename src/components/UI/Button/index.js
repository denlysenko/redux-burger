import React from 'react';

import classes from './styles.css';

const button = props => (
  <button
    type={props.type || 'submit'}
    className={[classes.Button, classes[props.btnType]].join(' ')}
    onClick={props.clicked}
    disabled={props.disabled}
  >
    {props.children}
  </button>
);

export default button;
