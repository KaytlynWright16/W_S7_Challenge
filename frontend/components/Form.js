import React, { useEffect, useState } from 'react'
import axios from 'axios'
import * as Yup from 'yup'

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

// 👇 Here you will create your schema.

// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]

export default function Form() {
  const [fullName, setFullName] = useState('')
  const [size, setSize] = useState('')
  const [selectToppings, setSelectToppings] = useState([])
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)
  const [isSubmitDisabled, setSubmitDisabled] = useState(true)

  const schema = Yup.object().shape({fullName: Yup.string().min(3, validationErrors.fullNameTooShort).max(20, validationErrors.fullNameTooLong).required('Full name is required'),
    size: Yup.string().oneOf(['S', 'M', 'L'], validationErrors.sizeIncorrect).required('Size is required')
  })
  console.log(size);

  useEffect(() => {
    const validateForm = async () => {
      try {
        await schema.validate({fullName, size: size.trim()}, {abortEarly: false})
        setSubmitDisabled(false)
      } catch (err) {
        const validationErrors = {} 
        err.inner.forEach(error => {
          validationErrors[error.path] = error.message
        })
        setErrors(validationErrors)
        setSubmitDisabled(true)
      }
    }

    validateForm()
  }, [fullName, size]) 

  const checkbox = (toppingId) => {
    setSelectToppings((prev) => {
      if (prev.includes(toppingId)) {
        return prev.filter((id) => id !== toppingId)
      }
      return [...prev, toppingId]
    })
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    const data = {
      fullName,
      size,
      toppings: selectToppings
    }

    try {
      await schema.validate(data, {abortEarly: false})
      await axios.post('http://localhost:9009/api/order', data)
      setSuccess(true)
      setError(false)
      setErrors({})

      setFullName('')
      setSize('')
      setSelectToppings([])
    } catch (err) {
      const validationErrors = {} 
      if (err.inner) {
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message
        })
      }
      setErrors(validationErrors)
      setSuccess(false)
      setError(true)
    }
  }
  return (
    <form onSubmit={onSubmit}>
      <h2>Order Your Pizza</h2>
      {success && <div className='success'>Thank you for your order, {fullName}!</div>}
      {error && <div className='failure'>Something went wrong</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input placeholder="Type full name" id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value.trim())} />
        </div>
        {errors.fullName && <div className='error'>{errors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select id="size" value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="">----Choose Size----</option>
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
            {/* Fill out the missing options */}
          </select>
          {errors.size && <div className='error'>{errors.size}</div>}
        </div>
        
      </div>

      <div className="input-group">
        {/* 👇 Maybe you could generate the checkboxes dynamically */}
        <label>Toppings</label>
        {toppings.map(topping => (
          <label key={topping.topping_id}>
            <input
            onChange={() => checkbox(topping.topping_id)}
            type="checkbox" checked={selectToppings.includes(topping.topping_id)}
          />
          {topping.text} <br />
          </label>
        ))}
      
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input type="submit" disabled={isSubmitDisabled}/>
    </form>
  )
}
