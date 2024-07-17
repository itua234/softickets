<select class="form-select quantity" 
                            name="quantity" 
                            data-ticket-index="<%= ticket.id %>"
                            data-ticket-name="<%= ticket.name %>"
                            data-ticket-price="<%= ticket.price %>">
                                <% for (let i = 0; i < ticket.purchase_limit + 1; i++){ %>
                                    <option value="<%= i %>"><%= i %></option>
                                <% }; %>
                            </select>