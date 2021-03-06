import React, { Component } from 'react';
import { connect } from 'react-redux';

import axios from '../../axios-orders';
import Burger from '../../components/Burger';
import BuildControls from '../../components/Burger/BuildControls';
import OrderSummary from '../../components/Burger/OrderSummary';
import Modal from '../../components/UI/Modal';
import Spinner from '../../components/UI/Spinner';
import Aux from '../../hoc/Aux';
import withErrorHandler from '../../hoc/withErrorHandler';
import * as actions from '../../store/actions';

export class BurgerBuilder extends Component {
  state = {
    purchasing: false
  };

  componentDidMount() {
    this.props.fetchIngredients();
  }

  updatePurchaseState(ingredients) {
    const sum = Object.keys(ingredients)
      .map(igKey => ingredients[igKey])
      .reduce((sum, el) => sum + el, 0);

    return sum > 0;
  }

  purchase = () => {
    if (this.props.isAuthenticated) {
      this.setState({ purchasing: true });
    } else {
      this.props.setRedirectPath('/checkout');
      this.props.history.push('/auth');
    }
  };

  cancelPurchase = () => {
    this.setState({ purchasing: false });
  };

  continuePurchase = () => {
    this.props.initPurchase();
    this.props.history.push('/checkout');
  };

  render() {
    const disabledInfo = { ...this.props.ingredients };

    for (const key in disabledInfo) {
      disabledInfo[key] = disabledInfo[key] <= 0;
    }

    const burger = this.props.ingredients ? (
      <Aux>
        <Burger ingredients={this.props.ingredients} />
        <BuildControls
          price={this.props.totalPrice}
          purchasable={this.updatePurchaseState(this.props.ingredients)}
          disabled={disabledInfo}
          isAuth={this.props.isAuthenticated}
          added={this.props.addIngredient}
          removed={this.props.removeIngredient}
          ordered={this.purchase}
        />
      </Aux>
    ) : this.props.error ? (
      <p>Ingredients can't be loaded!</p>
    ) : (
      <Spinner />
    );

    return (
      <Aux>
        <Modal show={this.state.purchasing} modalClosed={this.cancelPurchase}>
          {this.props.ingredients ? (
            <OrderSummary
              ingredients={this.props.ingredients}
              price={this.props.totalPrice}
              cancelled={this.cancelPurchase}
              continued={this.continuePurchase}
            />
          ) : null}
        </Modal>
        {burger}
      </Aux>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addIngredient: ingredientName =>
      dispatch(actions.addIngredient(ingredientName)),
    removeIngredient: ingredientName =>
      dispatch(actions.removeIngredient(ingredientName)),
    fetchIngredients: () => dispatch(actions.fetchIngredients()),
    initPurchase: () => dispatch(actions.initOrder()),
    setRedirectPath: path => dispatch(actions.setRedirectPath(path))
  };
};

const mapStateToProps = state => {
  return {
    ingredients: state.builder.ingredients,
    totalPrice: state.builder.totalPrice,
    error: state.builder.error,
    isAuthenticated: !!state.auth.token
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withErrorHandler(BurgerBuilder, axios)
);
