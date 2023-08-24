import { Grid, InputAdornment,makeStyles, ButtonGroup,Button as MuiButton} from '@material-ui/core';
import React, {useState, useEffect} from 'react';
import Form from '../../layouts/Form';
import  Input  from "../../controls/Input";
import  Select  from "../../controls/Select";
import  Button  from "../../controls/Button";
import { useForm } from '../../hooks/useForm';
// import {Input, Select, Button} from "./../controls";
import ReplayIcon from '@material-ui/icons/Replay';
import RestaurantMenuIcon from '@material-ui/icons/RestaurantMenu';
import ReorderIcon from '@material-ui/icons/Reorder';
import {createAPIEndpoint, ENDPOINTS} from '../../api';
import { roundTo2DecimalPoint } from '../../utils';
import Popup from '../../layouts/Popup';
import OrderList from './OrderList';
import Notification from '../../layouts/Notification';




const useStyles = makeStyles(theme => ({
    adornmentText: {
        '& .MuiTypography-root': {
            color: '#f3b33d',
            fontWeight: 'bolder',
            fontSize: '1.5em'
        }
    },
    submitButtonGroup: {
        backgroundColor: '#f3b33d',
        color: '#000',
        margin: theme.spacing(1),
        '& .MuiButton-label': {
            textTransform: 'none'
        },
        '&:hover': {
            backgroundColor: '#f3b33d',
        }
    }
}))


export default function OrderForm(props) {

const {values,setValues, errors,setErrors,handleInputChange, resetFormControls} = props;
const classes = useStyles();

const [customerList, setCustomerList] = useState([]);
const[orderListVisibility, setOrderListVisibility] = useState(false);
const [orderId, setOrderId] = useState(0);
const [notify, setNotify]= useState({isOpen : false})

useEffect(()=>{
    createAPIEndpoint(ENDPOINTS.CUSTOMER).fetchAll()
    .then(res =>{
        let customerList = res.data.map(item => ({
            id: item.customerId,
            title: item.customerName
        }));
        customerList =[{id:0, title:'Select'}].concat(customerList);
        setCustomerList(customerList);
    })
    .catch(err =>{
        console.log(err);
    })
},[])

    useEffect(() =>{
        let qTotal = values.orderDetails.reduce((tempTotal, item)=>{
                return tempTotal + (item.quantity * item.foodItemPrice);
        },0);

        setValues({
            ...values, 
            gTotal :roundTo2DecimalPoint(qTotal)});

    }, [JSON.stringify(values.orderDetails)]);

    useEffect(()=>{
        if(orderId ==0) resetFormControls()
        else{
            createAPIEndpoint(ENDPOINTS.ORDER).fetchById(orderId)
            .then(res =>{
                setValues(res.data);
                setErrors({});
            })
            .catch(err => (console.log(err)))
        }
    },[orderId]);

    const validateForm = () =>{
        let temp = {};
        temp.customerId = values.customerId != 0 ? "" :"This file is required.";
        temp.pMethod = values.pMethod != "none" ? "":"This file is required.";
        temp.orderDetails = values.orderDetails.lenght != 0 ? "": "This file is required.";
        setErrors({...temp});
        return Object.values(temp).every(x => x==="");
    }

    const submitOrder = e =>{
        e.preventDefault();
        if(validateForm())
        {
            if (values.orderMasterId == 0) {
            createAPIEndpoint(ENDPOINTS.ORDER).create(values)
            .then(res =>{
                resetFormControls();
                setNotify({isOpen : true, message :'New order is created.'});
            })
            .catch(err => console.log(err.response.data));
        }else{
            createAPIEndpoint(ENDPOINTS.ORDER).update(values.orderMasterId, values)
                    .then(res => {
                        setOrderId(0);
                        setNotify({isOpen:true, message:'The order is updated.'});
                    })
                    .catch(err => console.log(err));
        }
    }
 }

 const resetForm = ()=>{
    resetFormControls();
    setOrderId(0);
 }

    const openListOfOrders =()=>{
        setOrderListVisibility(true);
    }
  return (
    <>
    <Form onSubmit={submitOrder}>
      <Grid container>
        <Grid item xs={6}>
            <Input 
                disabled
                label="Order Number"
                name="orderNumber"
                value={values.orderNumber}
                InputProps ={{
                    startAdornment : <InputAdornment
                        className={classes.adornmentText}
                        position="start">#</InputAdornment>
                }}
            />
            <Select 
                label="Customer"
                name="customerId"
                onChange = {handleInputChange}
                options={customerList}
                value={values.customerId}
                error={errors.customerId}
                />
        </Grid>
        <Grid item xs={6}>
        <Select 
                label="Payment Method"
                name="pMethod"
                options={[
                    {id:'none' ,title :'Select'},
                    {id:'Cash' ,title :'Cash'},
                    {id:'Card' ,title :'Card'}
                ]}
                value={values.pMethod}
                onChange = {handleInputChange}
                error={errors.pMethod}
                
                />
        <Input 
            disabled
            label="Grand Total"
            name="gTotal"
            value={values.gTotal}
            InputProps ={{
                 startAdornment : <InputAdornment
                    className={classes.adornmentText}
                    position="start">R</InputAdornment>
            }}
            />
            <ButtonGroup className={classes.submitButtonGroup}>
                <MuiButton 

                    size='large'
                    endIcon={<RestaurantMenuIcon/>}
                    type='submit'>Submit</MuiButton>
                   <MuiButton 
                        size='small'
                        onClick={resetForm}
                        startIcon={<ReplayIcon/>}>R</MuiButton>
                
            </ButtonGroup>
            <Button 
                size="large"
                startIcon={<ReorderIcon/>}
                onClick={openListOfOrders}
                >Orders</Button>
        </Grid>
      </Grid>
    </Form>
    <Popup
        title="List of Orders"
        openPopup={orderListVisibility}
        setOpenPopup={setOrderListVisibility}>
        <OrderList {...{setOrderId, setOrderListVisibility, resetFormControls, setNotify}}/>
    </Popup>
    <Notification
        {...{notify,setNotify}}
    />
    </>
  )
}